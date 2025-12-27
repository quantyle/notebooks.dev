// src/pages/pageService.ts

import { PrismaClient } from "@notebooks.dev/db-client/notebooks-db";
import { CreatePageRequest, UpdatePageRequest, PageDTO } from "./page";

const prisma = new PrismaClient();

export class PageService {
  public async getAll(notebookId?: number): Promise<PageDTO[]> {
    return prisma.page.findMany({
      where: notebookId ? { notebookId } : undefined,
      orderBy: { id: "asc" },
    });
  }

  public async create(payload: CreatePageRequest): Promise<{ id: number }> {
    const page = await prisma.page.create({
      data: {
        title: payload.title,
        content: payload.content ?? "",
        notebookId: payload.notebookId,
      },
    });

    return { id: page.id };
  }

  public async update(
    id: number,
    data: UpdatePageRequest,
  ): Promise<{ updated: number }> {
    const result = await prisma.page.update({
      where: { id },
      data,
    });

    return { updated: result.id };
  }

  public async delete(id: number): Promise<void> {
    await prisma.page.delete({
      where: { id },
    });
  }
}
