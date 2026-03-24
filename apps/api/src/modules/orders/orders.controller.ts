import { Body, Controller, Get, Param, Post } from "@nestjs/common";

import { CurrentUser } from "../../common/decorators/current-user.decorator";
import type { AuthenticatedUser } from "../../common/types/request-with-user";
import { OrdersService } from "./orders.service";

type UpsertOrderRequest = {
  comment?: string;
  items: Array<{
    productId: string;
    quantity: number;
  }>;
};

@Controller("me/orders")
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get()
  async listMyOrders(@CurrentUser() user: AuthenticatedUser | undefined) {
    return {
      data: user ? await this.ordersService.listMyOrders(user) : [],
      ok: true
    };
  }

  @Get("current")
  async getCurrentOrder(@CurrentUser() user: AuthenticatedUser | undefined) {
    return {
      data: user ? await this.ordersService.getCurrentOrder(user) : null,
      ok: true
    };
  }

  @Get(":code")
  async getMyOrder(@Param("code") code: string, @CurrentUser() user: AuthenticatedUser | undefined) {
    return {
      data: user ? await this.ordersService.getMyOrder(code, user) : null,
      ok: true
    };
  }

  @Post("current")
  async upsertCurrentOrder(
    @CurrentUser() user: AuthenticatedUser | undefined,
    @Body() body: UpsertOrderRequest
  ) {
    return {
      data: user ? await this.ordersService.upsertCurrentOrder(user, body) : null,
      ok: true
    };
  }
}
