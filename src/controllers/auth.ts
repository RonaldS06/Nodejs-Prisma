import { Request, Response } from "express";
import Usuario, { IUser } from "../models/usuario";
import bcryptjs from "bcryptjs";
import { ROLES } from "../helpers/constants";
import randomstring from "randomstring";

import { sendEmail } from "../mailer.ts/mailer";
import generarJWT from "../helpers/generarJWT";
import { prisma } from "../app";

// Función asincrónica para manejar el registro de usuarios
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    // Extraer los datos del cuerpo de la solicitud
    const { nombre, email, password, rol }: IUser = req.body;

    // Validar campos requeridos
    if (!nombre || !email || !password) {
      res.status(400).json({ msg: "Faltan datos necesarios" });
      return;
    }

    const salt = bcryptjs.genSaltSync();
    const hashedPassword = bcryptjs.hashSync(password, salt);

    // Verificar si se proporciona la clave de administrador en los encabezados de la solicitud
    const adminKey = req.headers["admin-key"];
    let userRole = rol;
    if (adminKey === process.env.KEYFORADMIN) {
      // Si la clave de administrador es correcta, asignar el rol de administrador al usuario
      userRole = ROLES.admin;
    }

    // Generar código random para el usuario
    const newCode = randomstring.generate(6);

    // Crear objeto usuario con la información procesada
    const usuario: IUser = {
      nombre,
      email,
      password: hashedPassword,
      rol: userRole,
      code: newCode,
    };

    // Crear usuario en la base de datos
    const createdUser = await prisma.user.create({
      data: usuario,
    });

    // Enviar email con el código generado
    await sendEmail(email, newCode);

    res.status(201).json({ usuario: createdUser });
    console.log("Usuario creado");
  } catch (error) {
    console.error("Error al registrar usuario:", error);
    res.status(500).json({ msg: "Error al registrar usuario", error });
  } finally {
    prisma.$disconnect();
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  const { email, password }: IUser = req.body;
  try {
    // const usuario = await Usuario.findOne({ email });
    //FindFirst el primero que encuentra
    const usuario = await prisma.user.findFirst({
      where: { email },
    });

    if (!usuario) {
      res.status(400).json({ msg: "Correo inválido" });
      return;
    }

    const validarPassword = bcryptjs.compareSync(password, usuario.password);
    if (!validarPassword) {
      res.status(400).json({ msg: "Contraseña inválida" });
      return;
    }

    //Generar token para el logueo del usuario
    const token = await generarJWT(usuario.id);

    res.status(201).json({
      usuario,
      token,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      msg: "Error en el servidor",
    });
  }
};

export const verifyUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  // Extraemos el email y el código del cuerpo de la solicitud
  const { email, code } = req.body;
  try {
    // Buscamos al usuario en la base de datos por email
    // const usuario = await Usuario.findOne({ email });
    const usuario = await prisma.user.findFirst({
      where: { email },
    });

    // Si no se encuentra el usuario, devolvemos un error 400
    if (!usuario) {
      res.status(400).json({ msg: "No se encontro el mail en la BdD" });
      return;
    }
    // Si el usuario ya está verificado, devolvemos un error 400
    if (usuario.verified) {
      res.status(400).json({ msg: "El usuario ya se encuentra verificado" });
      return;
    }
    // Si el código ingresado no coincide, devolvemos un error 401
    if (usuario.code !== code) {
      res.status(401).json({ msg: "El código ingresado es incorrecto" });
      return;
    }

    // Actualizamos al usuario, marcándolo como verificado
    /* const usuarioActualizado = await Usuario.findOneAndUpdate(
      { email },
      { verified: true }
    ); */
    const usuarioActualizado = await prisma.user.update({
      where: { email },
      data: {
        verified: true,
      },
    });

    res.status(200).json({
      msg: "Usuario verificado correctamente",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Error en el servidor" });
  }
};
