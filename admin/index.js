import express from "express";
import * as amqp from "amqplib/callback_api.js";
import { PrismaClient } from "@prisma/client";
import cors from "cors";
import sendMessageToqueue from "./services/send-message-queue.js";

const app = express();
const prisma = new PrismaClient();
app.use(express.json());

app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "http://localhost:8080",
      "http://localhost:4200",
    ],
  })
);

app.get("/api/products", async (req, res) => {
  const products = await prisma.product.findMany({});
  return res.status(200).json({
    message: "Admin side all Products !",
    data: products,
  });
});

app.post("/api/product", async (req, res) => {
  try {
    const { name, description, price } = req.body;
    const newProduct = await prisma.product.create({
      data: {
        name,
        description,
        price,
      },
    });
    await sendMessageToqueue("product_created", JSON.stringify(newProduct));
    return res.status(201).json({
      message: "product Created Successfully!",
      data: newProduct,
    });
  } catch (error) {
    console.log(error);
    return res.json({
      message: "Internal server Error!",
    });
  }
});

app.put("/api/product/:id", async (req, res) => {
  try {
    const { name, description, price } = req.body;

    const oldProduct = await prisma.product.findMany({
      where: {
        id: Number(req.params.id),
      },
    });

    const updated = await prisma.product.update({
      where: {
        id: Number(req.params.id),
      },
      data: {
        name,
        description,
        price,
      },
    });

    const payload = {
      ...updated,
      oldName: oldProduct.name,
    };

    await sendMessageToqueue("product_updated", JSON.stringify(payload));

    return res.status(201).json({
      message: "product Updated Successfully!",
      data: updated,
    });
  } catch (error) {
    console.log(error);
    return res.json({
      message: "Internal server Error!",
    });
  }
});

app.delete("/api/product/:id", async (req, res) => {
  try {
    const find = await prisma.product.findFirst({
      where: {
        id: Number(req.params.id),
      },
    });

    if (!find) {
      return res.json({
        message: "Product not found!",
      });
    }

    await prisma.product.delete({
      where: {
        id: Number(req.params.id),
      },
    });

    await sendMessageToqueue(
      "product_deleted",
      JSON.stringify({ id: req.params.id, name: find.name })
    );

    return res.json({
      message: "Product Deleted!",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Internal server Error!",
    });
  }
});

app.listen(8000, (req, res) => {
  console.log("Admin service is running on port 8000");
});
