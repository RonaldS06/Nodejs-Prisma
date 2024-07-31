"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Server = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
// import { dbConnection } from "../database/config";
const auth_1 = __importDefault(require("../routes/auth"));
const order_1 = __importDefault(require("../routes/order"));
const issues_1 = __importDefault(require("../routes/issues"));
class Server {
    constructor() {
        this.app = (0, express_1.default)();
        this.port = process.env.PORT;
        this.authPath = "/auth";
        this.ordersPath = "/orders";
        this.issuesPath = "/issues";
        //Funciones
        // this.conectarDB();
        this.middlewares();
        this.routes();
    }
    /* async conectarDB(): Promise<void> {
      await dbConnection();
    } */
    middlewares() {
        this.app.use((0, cors_1.default)());
        this.app.use(express_1.default.json());
    }
    routes() {
        this.app.use(this.authPath, auth_1.default);
        this.app.use(this.ordersPath, order_1.default);
        this.app.use(this.issuesPath, issues_1.default);
    }
    listen() {
        this.app.listen(this.port, () => {
            console.log(`Servidor corriendo en el puerto ${this.port}`);
        });
    }
}
exports.Server = Server;
