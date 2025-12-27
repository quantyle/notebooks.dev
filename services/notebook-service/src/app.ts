// src/app.ts
import express, { json, urlencoded } from "express";
import { RegisterRoutes } from "./api/routes";
import helmet from "helmet";
import cors from "cors";
import swaggerUi from "swagger-ui-express";
import { Response, Request } from "express";
import path from "path";

export const app = express();

app.use(helmet());
app.use(cors({ origin: "http://localhost:3000" }));

app.use("/docs", swaggerUi.serve, async (_req: Request, res: Response) => {
  res.send(swaggerUi.generateHTML(await import("./api/swagger.json")));
});

app.get("/openapi.json", (_req: Request, res: Response) => {
  res.setHeader("Content-Type", "application/json");
  res.sendFile(path.join(__dirname, "api", "swagger.json"));
});

// Use body parser to read sent json payloads
app.use(
  urlencoded({
    extended: true,
  })
);
app.use(json());

RegisterRoutes(app);
