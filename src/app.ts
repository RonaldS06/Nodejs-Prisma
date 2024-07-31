import { Server } from "./models/server";
import { PrismaClient } from "@prisma/client";

export const prisma = new PrismaClient();

import dotenv from "dotenv";

dotenv.config();

const server = new Server();

server.listen();
