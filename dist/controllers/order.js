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
exports.createOrder = exports.getOrders = void 0;
const app_1 = require("../app");
// import { ObjectId } from "mongoose";
// Controlador para obtener todas las órdenes de un usuario específico
const getOrders = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    /* const usuarioId: ObjectId = req.body.usuarioConfirmado._id;
    const consulta = { user: usuarioId };
    const orders = await Order.find(consulta);
    res.json({
      data: [...orders],
    }); */
    const usuarioId = req.body.usuarioConfirmado.id;
    const orders = yield app_1.prisma.order.findMany({
        where: { userId: usuarioId },
        include: { shippingDetails: true },
    });
    res.json({
        data: [...orders],
    });
});
exports.getOrders = getOrders;
// Controlador para crear una nueva orden
const createOrder = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    /*   const usuario: ObjectId = req.body.usuarioConfirmado._id;
    const orderData: IOrder = req.body;
    const data = {
      ...orderData,
      createdAt: new Date(), //fecha de creación a la fecha y hora actuales.
      user: usuario,
      status: "pending",
    };
    const order = new Order(data);
    await order.save(); */
    const usuario = req.body.usuarioConfirmado.id;
    const orderData = req.body;
    const { price, shippingCost, total, items, shippingDetails } = orderData;
    const order = yield app_1.prisma.order.create({
        data: {
            price,
            shippingCost,
            total,
            items: {
                create: [...items],
            },
            userId: usuario,
            shippingDetails: {
                create: Object.assign({}, shippingDetails),
            },
        },
        include: {
            items: true,
            shippingDetails: true,
        },
    });
    res.status(201).json({
        data: order,
    });
});
exports.createOrder = createOrder;
