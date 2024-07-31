import { Request, Response } from "express";
import Order, { IOrder } from "../models/order";
import { prisma } from "../app";
// import { ObjectId } from "mongoose";

// Controlador para obtener todas las órdenes de un usuario específico
export const getOrders = async (req: Request, res: Response): Promise<void> => {
  /* const usuarioId: ObjectId = req.body.usuarioConfirmado._id;
  const consulta = { user: usuarioId };
  const orders = await Order.find(consulta);
  res.json({
    data: [...orders],
  }); */

  const usuarioId: number = req.body.usuarioConfirmado.id;

  const orders = await prisma.order.findMany({
    where: { userId: usuarioId },
    include: { shippingDetails: true },
  });

  res.json({
    data: [...orders],
  });
};

// Controlador para crear una nueva orden
export const createOrder = async (
  req: Request,
  res: Response
): Promise<void> => {
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

  const usuario: number = req.body.usuarioConfirmado.id;

  const orderData = req.body;

  const { price, shippingCost, total, items, shippingDetails } = orderData;

  const order = await prisma.order.create({
    data: {
      price,
      shippingCost,
      total,
      items: {
        create: [...items],
      },
      userId: usuario,
      shippingDetails: {
        create: {
          ...shippingDetails,
        },
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
};
