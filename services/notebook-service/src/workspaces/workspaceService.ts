// src/workspaces/workspaceService.ts

import { PrismaClient } from "@notebooks.dev/db-client/notebooks-db";
import {
  CreateWorkspaceRequest,
  UpdateWorkspaceRequest,
  WorkspaceDTO,
} from "./workspace";

const prisma = new PrismaClient();

export class WorkspaceService {
  public async getAll(): Promise<WorkspaceDTO[]> {
    return prisma.workspace.findMany({
      orderBy: { id: "asc" },
    });
  }

  public async create(
    payload: CreateWorkspaceRequest,
  ): Promise<{ id: number }> {
    const workspace = await prisma.workspace.create({
      data: {
        name: payload.name,
      },
    });

    return { id: workspace.id };
  }

  public async update(
    id: number,
    data: UpdateWorkspaceRequest,
  ): Promise<{ updated: number }> {
    const result = await prisma.workspace.update({
      where: { id },
      data,
    });

    return { updated: result.id };
  }

  public async delete(id: number): Promise<void> {
    await prisma.workspace.delete({
      where: { id },
    });
  }
}
