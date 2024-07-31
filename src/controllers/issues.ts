import { Request, Response } from "express";
import { prisma } from "../app";

export const postNewIssue = async (req: Request, res: Response) => {
  const { title, description, priority } = req.body;

  try {
    // Validar campos requeridos
    /*     if (
      !title ||
      !description ||
      !priority ||
      !req.body.usuarioConfirmado ||
      !req.body.usuarioConfirmado.id
    ) {
      return res.status(400).json({ msg: "Faltan datos necesarios" });
    } */

    const usuario: number = req.body.usuarioConfirmado.id;

    // Verificar si ya existe una Issue para el usuario
    const existingIssue = await prisma.issue.findUnique({
      where: {
        userId: usuario,
      },
    });

    if (existingIssue) {
      return res.status(400).json({
        msg: "Ya existe una Issue para este usuario",
      });
    }

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
