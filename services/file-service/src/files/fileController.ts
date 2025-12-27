// src/controllers/fileController.ts
import {
  Controller,
  Get,
  Post,
  Route,
  Body,
  Path,
  Put,
  Delete,
} from "tsoa";
import { CreateFileRequest, FileDTO, UpdateFileRequest } from "./file";
import { FileService } from "./filesService";

const fileService = new FileService();

@Route("file")
export class FileController extends Controller {
  @Get("/tree")
  public async getTree(): Promise<FileDTO[]> {
    return fileService.buildTree();
  }

  @Post()
  public async postFile(
    @Body() body: CreateFileRequest
  ): Promise<{ id: number }> {
    return fileService.createFile(body);
  }

  @Get("{id}")
  public async getFileById(@Path() id: number): Promise<FileDTO | null> {
    const file = await fileService.getFile(id);
    if (!file) this.setStatus(404);
    return file;
  }

  @Put("{id}")
  public async putFile(
    @Path() id: number,
    @Body() body: UpdateFileRequest
  ): Promise<{ updated: number }> {
    return fileService.updateFile(id, body);
  }

  @Delete("{id}")
  public async deleteFile(@Path() id: number): Promise<{ deleted: boolean }> {
    await fileService.deleteRecursive(id);
    return { deleted: true };
  }
}
