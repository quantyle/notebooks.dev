// src/notebooks/notebookService.ts

import { PrismaClient } from "@notebooks.dev/db-client/notebooks-db";
import {
  CreateNotebookRequest,
  UpdateNotebookRequest,
  NotebookDTO,
} from "./notebook";

const prisma = new PrismaClient();

export class NotebookService {
  public async getAll(workspaceId?: number): Promise<NotebookDTO[]> {
    return prisma.notebook.findMany({
      where: workspaceId ? { workspaceId } : undefined,
      orderBy: { id: "asc" },
    });
  }

  public async create(payload: CreateNotebookRequest): Promise<{ id: number }> {
    const notebook = await prisma.notebook.create({
      data: {
        name: payload.name,
        workspaceId: payload.workspaceId,
      },
    });

    return { id: notebook.id };
  }

  public async update(
    id: number,
    data: UpdateNotebookRequest,
  ): Promise<{ updated: number }> {
    const result = await prisma.notebook.update({
      where: { id },
      data,
    });

    return { updated: result.id };
  }

  public async delete(id: number): Promise<void> {
    await prisma.notebook.delete({
      where: { id },
    });
  }
}
