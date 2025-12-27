// src/services/FileService.ts
import { PrismaClient } from "@notebooks.dev/db-client/file-db";
import { CreateFileRequest, FileDTO, UpdateFileRequest } from "./file";

const prisma = new PrismaClient();

export class FileService {
  public async buildTree(parentId: number | null = null): Promise<FileDTO[]> {
    const files = await prisma.file.findMany({
      where: { parentId },
      orderBy: { id: "asc" },
    });

    return Promise.all(
      files.map(async (file) => ({
        id: file.id,
        name: file.name,
        type: file.type,
        content: file.content,
        parentId: file.parentId,
        children:
          file.type === "folder" ? await this.buildTree(file.id) : undefined,
      }))
    );
  }

  public async createFile(payload: CreateFileRequest): Promise<{ id: number }> {
    const file = await prisma.file.create({
      data: {
        name: payload.name,
        type: payload.type,
        content: payload.type === "file" ? payload.content ?? "" : null,
        parentId: payload.parentId ?? null,
      },
    });

    return { id: file.id };
  }

  public async getFile(id: number): Promise<FileDTO | null> {
    return prisma.file.findUnique({ where: { id } });
  }

  public async updateFile(
    id: number,
    data: UpdateFileRequest
  ): Promise<{ updated: number }> {
    const result = await prisma.file.update({
      where: { id },
      data,
    });

    return { updated: result.id };
  }

  public async deleteRecursive(id: number): Promise<void> {
    const children = await prisma.file.findMany({ where: { parentId: id } });

    for (const child of children) {
      await this.deleteRecursive(child.id);
    }

    await prisma.file.delete({ where: { id } });
  }
}
