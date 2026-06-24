import {
  All,
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Patch,
  Post,
  Put,
  Query,
  Req,
  Res,
} from "@nestjs/common";
import type { Request, Response } from "express";
import { AdminService } from "./admin.service";

type QueryValue = string | string[] | undefined;
type QueryParams = Record<string, QueryValue>;

function adminPath(request: Request) {
  return request.path.replace(/^\/api\/admin\/?/, "").replace(/^\/+/, "");
}

@Controller("admin")
export class AdminController {
  constructor(
    @Inject(AdminService) private readonly adminService: AdminService,
  ) {}

  @Get("*")
  async get(
    @Req() request: Request,
    @Query() query: QueryParams,
    @Res() response: Response,
  ) {
    const result = await this.adminService.get(adminPath(request), query);
    return response.status(result.status).json(result.body);
  }

  @Post("*")
  async post(
    @Req() request: Request,
    @Body() body: unknown,
    @Res() response: Response,
  ) {
    const result = await this.adminService.post(adminPath(request), body);
    return response.status(result.status).json(result.body);
  }

  @Put("*")
  async put(
    @Req() request: Request,
    @Body() body: unknown,
    @Res() response: Response,
  ) {
    const result = await this.adminService.put(adminPath(request), body);
    return response.status(result.status).json(result.body);
  }

  @Patch("*")
  async patch(
    @Req() request: Request,
    @Body() body: unknown,
    @Res() response: Response,
  ) {
    const result = await this.adminService.patch(adminPath(request), body);
    return response.status(result.status).json(result.body);
  }

  @Delete("*")
  async delete(@Req() request: Request, @Res() response: Response) {
    const result = await this.adminService.delete(adminPath(request));
    return response.status(result.status).json(result.body);
  }

  @All()
  async root(@Res() response: Response) {
    return response.status(404).json({
      status: 404,
      message: "관리자 API 경로를 찾을 수 없습니다.",
      code: "ADMIN_API_NOT_FOUND",
    });
  }
}
