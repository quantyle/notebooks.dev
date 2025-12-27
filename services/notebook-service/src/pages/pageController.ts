// src/pages/pageController.ts

import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Route,
  Body,
  Path,
  Query,
} from "tsoa";
import { PageDTO, CreatePageRequest, UpdatePageRequest } from "./page";
import { PageService } from "./pageService";

const pageService = new PageService();

@Route("pages")
export class PageController extends Controller {
  @Get()
  public async getPages(@Query() notebookId?: number): Promise<PageDTO[]> {
    return pageService.getAll(notebookId);
  }

  @Post()
  public async createPage(
    @Body() body: CreatePageRequest,
  ): Promise<{ id: number }> {
    return pageService.create(body);
  }

  @Put("{id}")
  public async updatePage(
    @Path() id: number,
    @Body() body: UpdatePageRequest,
  ): Promise<{ updated: number }> {
    return pageService.update(id, body);
  }

  @Delete("{id}")
  public async deletePage(@Path() id: number): Promise<{ deleted: boolean }> {
    await pageService.delete(id);
    return { deleted: true };
  }
}
