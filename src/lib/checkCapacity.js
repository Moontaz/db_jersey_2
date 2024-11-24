// utils/checkCapacity.js
import prisma from "../lib/prisma";

export const checkCapacity = async (orderDetails, variabelData) => {
  try {
    const quantity = parseInt(orderDetails.quantity);
    const kapasitasNormalPerHari =
      variabelData["kapasitas_normal_per_hari"] || 100;
    const kapasitasLemburPerJam =
      variabelData["kapasitas_lembur_per_jam"] || 11;
    const maksLemburPerHari = variabelData["maks_lembur_per_hari"] || 4;
    const maksLemburPerMinggu = variabelData["maks_lembur_per_minggu"] || 18;

    let initialDate = new Date(orderDetails.date);
    if (isNaN(initialDate.getTime())) throw new Error("Invalid initial date.");

    let currentDate = initialDate;
    const isExpress = orderDetails.serviceName.toLowerCase() === "express";

    // Function to skip Sundays (holidays)
    const skipSundays = (date) => {
      while (date.getDay() === 0) {
        date.setDate(date.getDate() + 1);
      }
      return date;
    };

    // Ensure initial date is not a Sunday
    currentDate = skipSundays(currentDate);

    if (isExpress) {
      // Handle Express Order
      const currentDateStr = currentDate.toISOString().split("T")[0];

      // Get existing schedules for the current date
      const existingSchedules = await prisma.jadwal.findMany({
        where: { starting_at: currentDate },
      });

      // Step 1: Check normal capacity
      const totalOrdersForDayNormal = existingSchedules
        .filter((schedule) => !schedule.is_overtime)
        .reduce((total, schedule) => total + schedule.jumlah_pesanan, 0);
      const availableCapacityNormal =
        kapasitasNormalPerHari - totalOrdersForDayNormal;

      if (availableCapacityNormal >= quantity) {
        // Accept jika kapasitas normal cukup
        return {
          status: "accept",
          message: `Order can be fulfilled on ${currentDateStr} using normal capacity.`,
          startDate: currentDateStr,
          lastDate: currentDateStr,
          is_overtime: false,
        };
      }

      // Step 2: Allocate to overtime if normal capacity is full
      let remainingQuantity = quantity - availableCapacityNormal;

      const totalOvertimeCapacity = kapasitasLemburPerJam * maksLemburPerHari;
      const totalOrdersForDayOvertime = existingSchedules
        .filter((schedule) => schedule.is_overtime)
        .reduce((total, schedule) => total + schedule.jumlah_pesanan, 0);
      const availableOvertimeCapacity =
        totalOvertimeCapacity - totalOrdersForDayOvertime;

      if (availableOvertimeCapacity >= remainingQuantity) {
        // Accept jika lembur cukup untuk memenuhi sisa pesanan
        return {
          status: "accept",
          message: `Order can be fulfilled on ${currentDateStr} using overtime.`,
          startDate: currentDateStr,
          lastDate: currentDateStr,
          is_overtime: true,
        };
      }

      // Reject jika kapasitas (normal + lembur) tidak cukup
      return {
        status: "reject",
        message: `Order exceeds total available capacity (normal + overtime) on ${currentDateStr}.`,
        startDate: null,
        lastDate: null,
      };
    } else {
      // Handle Regular Order (logika tetap sama)
      let daysChecked = 0;
      let lastAvailableDate = null;
      let remainingQuantity = quantity;

      while (remainingQuantity > 0 && daysChecked < 5) {
        currentDate = skipSundays(currentDate);
        const currentDateStr = currentDate.toISOString().split("T")[0];

        // Cek kapasitas reguler pada hari ini
        const existingSchedules = await prisma.jadwal.findMany({
          where: { starting_at: currentDate, is_overtime: false },
        });
        const totalOrdersForDay = existingSchedules.reduce(
          (total, schedule) => total + schedule.jumlah_pesanan,
          0
        );
        const availableCapacity = kapasitasNormalPerHari - totalOrdersForDay;

        if (availableCapacity > 0) {
          if (availableCapacity >= remainingQuantity) {
            return {
              status: "accept",
              message: `Order can be fulfilled on ${currentDateStr}.`,
              startDate: orderDetails.date,
              lastDate: currentDateStr,
              is_overtime: false,
            };
          } else {
            remainingQuantity -= availableCapacity;
          }
        }

        lastAvailableDate = currentDateStr;
        daysChecked++;

        currentDate.setDate(currentDate.getDate() + 1);
      }

      if (remainingQuantity > 0) {
        const remainingPercentage = (remainingQuantity / quantity) * 100;

        if (remainingPercentage <= 50) {
          return {
            status: "negotiate",
            message: `Order requires extending to a sixth day with ${remainingQuantity} items remaining (${remainingPercentage.toFixed(
              2
            )}% of total order).`,
            startDate: initialDate.toISOString().split("T")[0],
            lastDate: currentDate.toISOString().split("T")[0],
            is_overtime: false,
          };
        } else {
          return {
            status: "reject",
            message: `Order exceeds capacity and requires ${remainingQuantity} items to be fulfilled on a sixth day (${remainingPercentage.toFixed(
              2
            )}% of total order).`,
            startDate: null,
            lastDate: null,
          };
        }
      }

      return {
        status: "accept",
        message: `Order can be fulfilled within ${daysChecked} days.`,
        startDate: initialDate.toISOString().split("T")[0],
        lastDate: lastAvailableDate,
        is_overtime: false,
      };
    }
  } catch (error) {
    console.error("Error in checkCapacity:", error);
    return {
      status: "error",
      message: error.message || "Error checking capacity.",
      startDate: null,
      lastDate: null,
    };
  }
};
