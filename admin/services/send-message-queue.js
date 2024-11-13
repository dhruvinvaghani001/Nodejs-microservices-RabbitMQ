import amqp from "amqplib";

export default async function sendMessageToqueue(queueName, message) {
  try {
    const connection = await amqp.connect(process.env.AMQP_URI);
    const channel = await connection.createChannel();

    await channel.assertQueue(queueName, {
      durable: true,
    });

    channel.sendToQueue(queueName, Buffer.from(message), {
      persistent: true,
    });

    console.log(`Message sent to queue ${queueName}: ${message}`);

    await channel.close();
    await connection.close();
  } catch (error) {
    console.error("Error sending message to RabbitMQ:", error);
    throw new Error("internal server Error!");
  }
}
