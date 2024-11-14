// utils/handleConfirmOrder.js
import prisma from "../lib/prisma";
import { checkCapacity } from "./checkCapacity";

export const handleConfirmOrder = async (orderDetails) => {
  try {
    const variabelData = await prisma.variabel.findMany();
    const variabelMap = variabelData.reduce((acc, item) => {
      acc[item.nama_variabel] = item.nilai_variabel;
      return acc;
    }, {});

    const capacityResult = await checkCapacity(orderDetails, variabelMap);
    if (
      capacityResult.status === "reject" ||
      capacityResult.status === "error"
    ) {
      throw new Error(capacityResult.message || "Order cannot be fulfilled.");
    }

    const { startDate, lastDate, is_overtime } = capacityResult;

    const newOrder = await prisma.$transaction(async (prisma) => {
      const pesanan = await prisma.pesanan.create({
        data: {
          nama_pelanggan: orderDetails.customerName,
          no_hp: orderDetails.phoneNumber,
          id_layanan: parseInt(orderDetails.service),
          jumlah_pesanan: parseInt(orderDetails.quantity),
          tanggal_masuk: new Date(startDate),
          keterangan: orderDetails.note || "",
          status_pesanan: "pending",
        },
      });

      let remainingQuantity = parseInt(orderDetails.quantity);
      let currentDate = new Date(startDate);

      while (remainingQuantity > 0) {
        const currentDateStr = currentDate.toISOString().split("T")[0];
        const useOvertime = is_overtime && currentDateStr === lastDate;
        const dailyCapacity = useOvertime
          ? variabelMap["kapasitas_lembur_per_jam"] *
            variabelMap["maks_lembur_per_hari"]
          : variabelMap["kapasitas_normal_per_hari"];
        const existingSchedules = await prisma.jadwal.findMany({
          where: { starting_at: currentDate, is_overtime: useOvertime },
        });
        const totalOrdersForDay = existingSchedules.reduce(
          (total, schedule) => total + schedule.jumlah_pesanan,
          0
        );

        const availableCapacity = dailyCapacity - totalOrdersForDay;
        const quantityForToday = Math.min(remainingQuantity, availableCapacity);

        await prisma.jadwal.create({
          data: {
            id_pesanan: pesanan.id_pesanan,
            jumlah_pesanan: quantityForToday,
            starting_at: currentDate,
            is_overtime: useOvertime,
          },
        });

        remainingQuantity -= quantityForToday;
        if (remainingQuantity > 0)
          currentDate.setDate(currentDate.getDate() + 1);
      }

      return pesanan;
    });

    return newOrder;
  } catch (error) {
    console.error("Error in handleConfirmOrder:", error);
    throw error;
  }
};
