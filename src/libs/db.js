import {PrismaClient} from "../generated/prisma/index.js"

const globalForPrisma = globalThis;

export const db = globalForPrisma.prisma || new PrismaClient()

if (process.env.NODE_ENV !== "live") globalForPrisma.prisma = db