"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyUser = exports.login = exports.register = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const constants_1 = require("../helpers/constants");
const randomstring_1 = __importDefault(require("randomstring"));
const mailer_1 = require("../mailer.ts/mailer");
const generarJWT_1 = __importDefault(require("../helpers/generarJWT"));
const app_1 = require("../app");
// Función asincrónica para manejar el registro de usuarios
const register = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Extraer los datos del cuerpo de la solicitud
        const { nombre, email, password, rol } = req.body;
        // Validar campos requeridos
        if (!nombre || !email || !password) {
            res.status(400).json({ msg: "Faltan datos necesarios" });
            return;
        }
        const salt = bcryptjs_1.default.genSaltSync();
        const hashedPassword = bcryptjs_1.default.hashSync(password, salt);
        // Verificar si se proporciona la clave de administrador en los encabezados de la solicitud
        const adminKey = req.headers["admin-key"];
        let userRole = rol;
        if (adminKey === process.env.KEYFORADMIN) {
            // Si la clave de administrador es correcta, asignar el rol de administrador al usuario
            userRole = constants_1.ROLES.admin;
        }
        // Generar código random para el usuario
        const newCode = randomstring_1.default.generate(6);
        // Crear objeto usuario con la información procesada
        const usuario = {
            nombre,
            email,
            password: hashedPassword,
            rol: userRole,
            code: newCode,
        };
        // Crear usuario en la base de datos
        const createdUser = yield app_1.prisma.user.create({
            data: usuario,
        });
        // Enviar email con el código generado
        yield (0, mailer_1.sendEmail)(email, newCode);
        res.status(201).json({ usuario: createdUser });
        console.log("Usuario creado");
    }
    catch (error) {
        console.error("Error al registrar usuario:", error);
        res.status(500).json({ msg: "Error al registrar usuario", error });
    }
    finally {
        app_1.prisma.$disconnect();
    }
});
exports.register = register;
const login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    try {
        // const usuario = await Usuario.findOne({ email });
        //FindFirst el primero que encuentra
        const usuario = yield app_1.prisma.user.findFirst({
            where: { email },
        });
        if (!usuario) {
            res.status(400).json({ msg: "Correo inválido" });
            return;
        }
        const validarPassword = bcryptjs_1.default.compareSync(password, usuario.password);
        if (!validarPassword) {
            res.status(400).json({ msg: "Contraseña inválida" });
            return;
        }
        //Generar token para el logueo del usuario
        const token = yield (0, generarJWT_1.default)(usuario.id);
        res.status(201).json({
            usuario,
            token,
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({
            msg: "Error en el servidor",
        });
    }
});
exports.login = login;
const verifyUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // Extraemos el email y el código del cuerpo de la solicitud
    const { email, code } = req.body;
    try {
        // Buscamos al usuario en la base de datos por email
        // const usuario = await Usuario.findOne({ email });
        const usuario = yield app_1.prisma.user.findFirst({
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
        const usuarioActualizado = yield app_1.prisma.user.update({
            where: { email },
            data: {
                verified: true,
            },
        });
        res.status(200).json({
            msg: "Usuario verificado correctamente",
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ msg: "Error en el servidor" });
    }
});
exports.verifyUser = verifyUser;
