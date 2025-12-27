// src/notebooks/notebookController.ts

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
import {
  CreateNotebookRequest,
  UpdateNotebookRequest,
  NotebookDTO,
} from "./notebook";
import { NotebookService } from "./notebookService";

const notebookService = new NotebookService();

@Route("notebooks")
export class NotebookController extends Controller {
  @Get()
  public async getNotebooks(
    @Query() workspaceId?: number,
  ): Promise<NotebookDTO[]> {
    return notebookService.getAll(workspaceId);
  }

  @Post()
  public async createNotebook(
    @Body() body: CreateNotebookRequest,
  ): Promise<{ id: number }> {
    return notebookService.create(body);
  }

  @Put("{id}")
  public async updateNotebook(
    @Path() id: number,
    @Body() body: UpdateNotebookRequest,
  ): Promise<{ updated: number }> {
    return notebookService.update(id, body);
  }

  @Delete("{id}")
  public async deleteNotebook(
    @Path() id: number,
  ): Promise<{ deleted: boolean }> {
    await notebookService.delete(id);
    return { deleted: true };
  }
}
