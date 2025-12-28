// src/pages/pageService.ts

import { PrismaClient } from "@notebooks.dev/db-client/notebooks-db";
import { CreatePageRequest, UpdatePageRequest, PageDTO } from "./page";
import type { JSONContent } from "@tiptap/core";

const prisma = new PrismaClient();

// Optional: shared empty Tiptap doc
const EMPTY_DOC: JSONContent = {
  type: "doc",
  content: [],
};

export class PageService {
  public async getAll(notebookId?: number): Promise<PageDTO[]> {
    return prisma.page.findMany({
      where: notebookId ? { notebookId } : undefined,
      orderBy: { id: "asc" },
    }) as unknown as PageDTO[];
  }

  public async create(payload: CreatePageRequest): Promise<{ id: number }> {
    const page = await prisma.page.create({
      data: {
        title: payload.title,
        content: payload.content ?? EMPTY_DOC, // ⬅️ JSON, not string
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
      data: {
        ...data,
        ...(data.content ? { content: data.content } : {}),
      },
    });

    return { updated: result.id };
  }

  public async delete(id: number): Promise<void> {
    await prisma.page.delete({
      where: { id },
    });
  }
}
