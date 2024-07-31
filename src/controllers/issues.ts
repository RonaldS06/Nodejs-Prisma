import { Request, Response } from "express";
import { prisma } from "../app";

export const postNewIssue = async (req: Request, res: Response) => {
  try {
    const { title, description, priority } = req.body;

    // Validar campos requeridos
    /* if (
      !title ||
      !description ||
      !priority ||
      !req.body.usuarioConfirmado ||
      !req.body.usuarioConfirmado.id
    ) {
      return res.status(400).json({ msg: "Faltan datos necesarios" });
    } */

    const usuario: number = req.body.usuarioConfirmado.id;

    const issueData = {
      title,
      description,
      priority,
      userId: usuario,
      createdAt: new Date(),
    };

    const issue = await prisma.issue.create({
      data: { ...issueData },
    });

    res.status(201).json({ issue });
  } catch (error) {
    console.error("Error al crear la issue:", error);
    res.status(500).json({ msg: "Error al crear la issue", error });
  } finally {
    prisma.$disconnect();
  }
};
