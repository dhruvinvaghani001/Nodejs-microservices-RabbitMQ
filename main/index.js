import express from "express";
import * as amqp from "amqplib";
import { PrismaClient } from "@prisma/client";

const app = express();
const prisma = new PrismaClient();

const startRabbitMQConsumer = async () => {
  try {
    const connection = await amqp.connect(process.env.AMQP_URI);
    const channel = await connection.createChannel();

    await channel.assertQueue("product_created", { durable: true });

    channel.consume(
      "product_created",
      async (msg) => {
        if (msg) {
          const eventProduct = JSON.parse(msg.content.toString());

          await prisma.product.create({
            data: {
              name: eventProduct.name,
              description: eventProduct.description,
              price: eventProduct.price,
            },
          });

          console.log("Product created and saved to DB:", eventProduct);

          channel.ack(msg);
        }
      },
      { noAck: false }
    );

    console.log("RabbitMQ consumer is running...");
  } catch (error) {
    console.error("Error starting RabbitMQ consumer:", error);
  }
};

startRabbitMQConsumer();

app.get("/", (req, res) => {
  res.send("Express server is running and consuming RabbitMQ messages!");
});

app.listen(8080, () => {
  console.log("Main server is running on port 8080");
});
