import { Injectable, NestMiddleware } from "@nestjs/common";
import type { NextFunction, Response } from "express";

import type { RequestWithUser } from "../../common/types/request-with-user";
import { AuthService } from "./auth.service";

@Injectable()
export class AuthContextMiddleware implements NestMiddleware {
  constructor(private readonly authService: AuthService) {}

  use(request: RequestWithUser, _response: Response, next: NextFunction): void {
    request.user = this.authService.resolveUserFromHeaders(request.headers);
    next();
  }
}
