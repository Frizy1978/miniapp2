import { Controller, Get } from "@nestjs/common";

import { BatchesService } from "./batches.service";

@Controller("batches")
export class BatchesController {
  constructor(private readonly batchesService: BatchesService) {}

  @Get("current")
  async getCurrentBatch() {
    return {
      data: await this.batchesService.getCurrentBatch(),
      ok: true
    };
  }
}
