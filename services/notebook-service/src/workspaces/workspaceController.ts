// src/workspaces/workspaceController.ts

import { Controller, Get, Post, Put, Delete, Route, Body, Path } from "tsoa";
import {
  CreateWorkspaceRequest,
  UpdateWorkspaceRequest,
  WorkspaceDTO,
} from "./workspace";
import { WorkspaceService } from "./workspaceService";

const workspaceService = new WorkspaceService();

@Route("workspaces")
export class WorkspaceController extends Controller {
  @Get()
  public async getWorkspaces(): Promise<WorkspaceDTO[]> {
    return workspaceService.getAll();
  }

  @Post()
  public async createWorkspace(
    @Body() body: CreateWorkspaceRequest,
  ): Promise<{ id: number }> {
    return workspaceService.create(body);
  }

  @Put("{id}")
  public async updateWorkspace(
    @Path() id: number,
    @Body() body: UpdateWorkspaceRequest,
  ): Promise<{ updated: number }> {
    return workspaceService.update(id, body);
  }

  @Delete("{id}")
  public async deleteWorkspace(
    @Path() id: number,
  ): Promise<{ deleted: boolean }> {
    await workspaceService.delete(id);
    return { deleted: true };
  }
}
