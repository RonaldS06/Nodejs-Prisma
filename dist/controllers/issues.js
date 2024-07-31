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
Object.defineProperty(exports, "__esModule", { value: true });
exports.postNewIssue = void 0;
const app_1 = require("../app");
const postNewIssue = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
        const usuario = req.body.usuarioConfirmado.id;
        const issueData = {
            title,
            description,
            priority,
            userId: usuario,
            createdAt: new Date(),
        };
        const issue = yield app_1.prisma.issue.create({
            data: Object.assign({}, issueData),
        });
        res.status(201).json({ issue });
    }
    catch (error) {
        console.error("Error al crear la issue:", error);
        res.status(500).json({ msg: "Error al crear la issue", error });
    }
    finally {
        app_1.prisma.$disconnect();
    }
});
exports.postNewIssue = postNewIssue;
