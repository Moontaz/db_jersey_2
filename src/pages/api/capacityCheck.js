// pages/api/capacityCheck.js
import { checkCapacity } from "../../lib/checkCapacity";
import prisma from "../../lib/prisma";

export default async function handler(req, res) {
  if (req.method === "POST") {
    const { orderDetails, variabelData } = req.body;

    try {
      const result = await checkCapacity(orderDetails, variabelData);
      return res.status(200).json(result);
    } catch (error) {
      console.error("Error in capacity check:", error);
      return res.status(500).json({ status: "error", message: error.message });
    }
  } else {
    res.setHeader("Allow", ["POST"]);
    res.status(405).end("Method Not Allowed");
  }
}
