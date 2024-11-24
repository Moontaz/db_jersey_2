import { handleConfirmOrder } from "@/lib/handleConfirmOrder";

export default async function handler(req, res) {
  if (req.method === "POST") {
    try {
      const { orderDetails, startDate, capacityResult } = req.body;

      if (!orderDetails || !startDate || !capacityResult) {
        throw new Error("Missing required fields.");
      }

      const result = await handleConfirmOrder(
        orderDetails,
        startDate,
        capacityResult
      );
      return res.status(200).json(result);
    } catch (error) {
      console.error("Error in API Route:", error);
      return res.status(500).json({ error: error.message });
    }
  } else {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).end("Method Not Allowed");
  }
}
