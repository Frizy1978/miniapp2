import { Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";

import type { AuthenticatedUser } from "../../common/types/request-with-user";
import { PrismaService } from "../../common/prisma/prisma.service";
import { AdminService } from "./admin.service";

const pdfMake = require("pdfmake/build/pdfmake");
const pdfFonts = require("pdfmake/build/vfs_fonts");

pdfMake.addVirtualFileSystem(pdfFonts);

type ExportFile = {
  buffer: Buffer;
  filename: string;
};

type PdfContent = Record<string, unknown>;
type PdfTableBody = Array<Array<Record<string, unknown> | string>>;

@Injectable()
export class PdfExportService {
  constructor(
    private readonly adminService: AdminService,
    private readonly prisma: PrismaService
  ) {}

  async createCustomersPdf(batchCode?: string, currentUser?: AuthenticatedUser): Promise<ExportFile> {
    const batchDetails = batchCode
      ? await this.adminService.getBatchDetails(batchCode)
      : await this.getFallbackBatchDetails();
    const resolvedCode = batchDetails.batch.code;
    const docDefinition = {
      content: [
        this.createTitle(`Поставка ${resolvedCode}`),
        this.createSubtitle("Сводка по покупателям"),
        this.createMetaGrid([
          ["Статус", batchDetails.batch.status],
          ["Прием до", this.formatDate(batchDetails.batch.closesAt)],
          ["Доставка", this.formatDate(batchDetails.batch.deliveryAt)],
          ["Заказов", String(batchDetails.totals.ordersCount)],
          ["Покупателей", String(batchDetails.totals.buyersCount)],
          ["Сумма", this.formatRub(batchDetails.totals.subtotal)]
        ]),
        ...batchDetails.orders.flatMap((order, index) => [
          {
            margin: [0, index === 0 ? 8 : 18, 0, 6],
            style: "sectionTitle",
            text: `${order.buyer.displayName} · ${order.code}`
          },
          {
            margin: [0, 0, 0, 6],
            text: [
              `Telegram: ${order.buyer.username ? `@${order.buyer.username}` : "—"}    `,
              `Локация: ${order.buyer.locality ?? "—"}    `,
              `Подтвержден: ${this.formatDate(order.confirmedAt ?? order.createdAt)}`
            ]
          },
          this.createTable(
            [
              [
                this.createTableHead("Товар"),
                this.createTableHead("Кол-во"),
                this.createTableHead("Цена"),
                this.createTableHead("Сумма")
              ],
              ...order.items.map((item) => [
                item.productNameSnapshot,
                `${this.formatQuantity(item.quantity)} ${item.unitLabelSnapshot ?? "ед."}`,
                this.formatRub(this.calculateUnitPrice(item.lineTotal, item.quantity)),
                this.formatRub(item.lineTotal)
              ])
            ],
            [210, 90, 90, 90]
          ),
          {
            columns: [
              {
                text: order.comment ? `Комментарий: ${order.comment}` : "Комментарий: —",
                width: "*"
              },
              {
                alignment: "right",
                text: `Итого: ${this.formatRub(order.subtotal)}`,
                width: 140
              }
            ],
            margin: [0, 6, 0, 0]
          }
        ])
      ],
      defaultStyle: {
        font: "Roboto",
        fontSize: 10,
        lineHeight: 1.25
      },
      footer: (currentPage: number, pageCount: number) => ({
        alignment: "right",
        margin: [32, 0, 32, 18],
        text: `Fish Olha · ${resolvedCode} · ${currentPage}/${pageCount}`
      }),
      info: {
        author: "Fish Olha Mini App",
        subject: `Поставка ${resolvedCode} · покупатели`,
        title: `Fish Olha ${resolvedCode} customers`
      },
      pageMargins: [32, 28, 32, 34],
      styles: {
        muted: {
          color: "#617180",
          fontSize: 9
        },
        sectionTitle: {
          bold: true,
          fontSize: 14
        },
        tableHead: {
          bold: true,
          color: "#12364a",
          fillColor: "#e8f4fb"
        },
        title: {
          bold: true,
          color: "#12364a",
          fontSize: 20
        }
      }
    };

    await this.logExport(currentUser, "customers_pdf", resolvedCode);

    return {
      buffer: await this.renderPdf(docDefinition),
      filename: `fisholha-${resolvedCode}-buyers.pdf`
    };
  }

  async createProductsPdf(batchCode?: string, currentUser?: AuthenticatedUser): Promise<ExportFile> {
    const summary = await this.adminService.getProductsSummary(batchCode);
    const resolvedCode = summary.batch?.code ?? "no-batch";
    const docDefinition = {
      content: [
        this.createTitle(`Поставка ${resolvedCode}`),
        this.createSubtitle("Сводная ведомость по товарам"),
        this.createMetaGrid([
          ["Статус", summary.batch?.status ?? "—"],
          ["Прием до", this.formatDate(summary.batch?.closesAt ?? null)],
          ["Доставка", this.formatDate(summary.batch?.deliveryAt ?? null)],
          ["Уникальных товаров", String(summary.totals.uniqueProducts)],
          ["Покупателей", String(summary.totals.buyersCount)],
          ["Выручка", this.formatRub(summary.totals.revenue)]
        ]),
        this.createTable(
          [
            [
              this.createTableHead("Товар"),
              this.createTableHead("Ед."),
              this.createTableHead("Кол-во"),
              this.createTableHead("Покупатели"),
              this.createTableHead("Заказы"),
              this.createTableHead("Сумма")
            ],
            ...summary.items.map((item) => [
              item.name,
              item.unitLabel ?? "ед.",
              this.formatQuantity(item.totalQuantity),
              String(item.buyersCount),
              String(item.ordersCount),
              this.formatRub(item.totalRevenue)
            ])
          ],
          [210, 44, 74, 60, 52, 76]
        )
      ],
      defaultStyle: {
        font: "Roboto",
        fontSize: 10,
        lineHeight: 1.25
      },
      footer: (currentPage: number, pageCount: number) => ({
        alignment: "right",
        margin: [32, 0, 32, 18],
        text: `Fish Olha · ${resolvedCode} · ${currentPage}/${pageCount}`
      }),
      info: {
        author: "Fish Olha Mini App",
        subject: `Поставка ${resolvedCode} · товары`,
        title: `Fish Olha ${resolvedCode} products`
      },
      pageMargins: [32, 28, 32, 34],
      pageOrientation: "landscape",
      styles: {
        tableHead: {
          bold: true,
          color: "#12364a",
          fillColor: "#e8f4fb"
        },
        title: {
          bold: true,
          color: "#12364a",
          fontSize: 20
        }
      }
    };

    await this.logExport(currentUser, "products_pdf", resolvedCode);

    return {
      buffer: await this.renderPdf(docDefinition),
      filename: `fisholha-${resolvedCode}-products.pdf`
    };
  }

  private async getFallbackBatchDetails() {
    const openBatch = await this.prisma.orderBatch.findFirst({
      orderBy: [{ startsAt: "desc" }, { createdAt: "desc" }],
      where: {
        status: "open"
      }
    });

    if (openBatch) {
      return this.adminService.getBatchDetails(openBatch.code);
    }

    const latestBatch = await this.prisma.orderBatch.findFirst({
      orderBy: [{ startsAt: "desc" }, { createdAt: "desc" }]
    });

    if (!latestBatch) {
      throw new Error("No batch is available for export");
    }

    return this.adminService.getBatchDetails(latestBatch.code);
  }

  private createTitle(text: string): PdfContent {
    return {
      style: "title",
      text
    };
  }

  private createSubtitle(text: string): PdfContent {
    return {
      margin: [0, 4, 0, 14],
      style: "muted",
      text
    };
  }

  private createMetaGrid(items: Array<[string, string]>): PdfContent {
    return {
      columns: items.map(([label, value]) => ({
        margin: [0, 0, 10, 12],
        stack: [
          {
            style: "muted",
            text: label
          },
          {
            bold: true,
            margin: [0, 2, 0, 0],
            text: value
          }
        ],
        width: "*"
      }))
    };
  }

  private createTable(body: PdfTableBody, widths: Array<number | string>): PdfContent {
    return {
      layout: {
        fillColor: (rowIndex: number) => (rowIndex === 0 ? "#e8f4fb" : rowIndex % 2 === 0 ? "#f8fbfd" : null),
        hLineColor: () => "#d5dde5",
        vLineColor: () => "#d5dde5"
      },
      table: {
        body,
        headerRows: 1,
        widths
      }
    };
  }

  private createTableHead(text: string): PdfContent {
    return {
      style: "tableHead",
      text
    };
  }

  private async renderPdf(docDefinition: Record<string, unknown>) {
    const document = pdfMake.createPdf(docDefinition);
    const bytes = (await document.getBuffer()) as Uint8Array;

    return Buffer.from(bytes);
  }

  private calculateUnitPrice(lineTotal: Prisma.Decimal | string, quantity: Prisma.Decimal | string) {
    const quantityValue = Number.parseFloat(quantity.toString());
    const lineTotalValue = Number.parseFloat(lineTotal.toString());

    if (!Number.isFinite(quantityValue) || quantityValue <= 0) {
      return "0";
    }

    return new Prisma.Decimal(lineTotalValue / quantityValue).toFixed(2);
  }

  private formatRub(value: Prisma.Decimal | string | number | null) {
    const numericValue =
      typeof value === "number"
        ? value
        : typeof value === "string"
          ? Number.parseFloat(value)
          : value instanceof Prisma.Decimal
            ? Number.parseFloat(value.toString())
            : Number.NaN;

    if (!Number.isFinite(numericValue)) {
      return "0 руб.";
    }

    return `${new Intl.NumberFormat("ru-RU", {
      maximumFractionDigits: 2,
      minimumFractionDigits: Number.isInteger(numericValue) ? 0 : 2
    }).format(numericValue)} руб.`;
  }

  private formatQuantity(value: Prisma.Decimal | string | number | null) {
    const numericValue =
      typeof value === "number"
        ? value
        : typeof value === "string"
          ? Number.parseFloat(value)
          : value instanceof Prisma.Decimal
            ? Number.parseFloat(value.toString())
            : Number.NaN;

    if (!Number.isFinite(numericValue)) {
      return "0";
    }

    return new Intl.NumberFormat("ru-RU", {
      maximumFractionDigits: 3
    }).format(numericValue);
  }

  private formatDate(value: Date | string | null) {
    if (!value) {
      return "—";
    }

    return new Date(value).toLocaleString("ru-RU", {
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      month: "long",
      year: "numeric"
    });
  }

  private async logExport(currentUser: AuthenticatedUser | undefined, action: string, entityId: string) {
    if (!currentUser) {
      return;
    }

    const adminUser = await this.prisma.user.findFirst({
      where: {
        telegramIdentity: {
          telegramUserId: currentUser.telegramUserId
        }
      }
    });

    if (!adminUser) {
      return;
    }

    await this.prisma.adminAuditLog.create({
      data: {
        action,
        adminUserId: adminUser.id,
        entityId,
        entityType: "OrderBatch",
        payloadJson: {
          generatedAt: new Date().toISOString()
        }
      }
    });
  }
}
