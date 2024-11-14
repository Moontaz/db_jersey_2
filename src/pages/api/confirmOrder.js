// pages/api/confirmOrder.js
import { handleConfirmOrder } from "../../lib/handleConfirmOrder";
import prisma from "../../lib/prisma";

export default async function handler(req, res) {
  if (req.method === "POST") {
    const { orderDetails, startDate } = req.body;

    try {
      const result = await handleConfirmOrder(orderDetails, startDate);
      return res.status(200).json(result);
    } catch (error) {
      console.error("Error in order confirmation:", error);
      return res.status(500).json({ error: error.message });
    }
  } else {
    res.setHeader("Allow", ["POST"]);
    res.status(405).end("Method Not Allowed");
  }
}
