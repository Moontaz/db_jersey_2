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
    let remainingQuantity = quantity;
    let lastDate = null;
    const isExpress = orderDetails.serviceName.toLowerCase() === "express";

    if (isExpress) {
      // Handle Express Order
      const currentDateStr = currentDate.toISOString().split("T")[0];
      const existingSchedules = await prisma.jadwal.findMany({
        where: { starting_at: currentDate },
      });
      const totalOrdersForDay = existingSchedules.reduce(
        (total, schedule) => total + schedule.jumlah_pesanan,
        0
      );
      const availableCapacity = kapasitasNormalPerHari - totalOrdersForDay;

      if (availableCapacity >= remainingQuantity) {
        // Enough capacity in regular hours for Express order
        return {
          status: "accept",
          message: `Can fulfill on ${currentDateStr} without overtime.`,
          startDate: currentDateStr,
          lastDate: currentDateStr,
          is_overtime: false,
        };
      }

      // Check weekly and daily overtime capacity for Express order
      const startOfWeek = new Date(currentDate);
      startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(endOfWeek.getDate() + 6);

      const weeklyOvertimeSchedules = await prisma.jadwal.findMany({
        where: {
          starting_at: { gte: startOfWeek, lte: endOfWeek },
          is_overtime: true,
        },
      });
      const totalOvertimeHoursThisWeek = weeklyOvertimeSchedules.reduce(
        (total, schedule) =>
          total + schedule.jumlah_pesanan / kapasitasLemburPerJam,
        0
      );

      if (totalOvertimeHoursThisWeek >= maksLemburPerMinggu) {
        return {
          status: "reject",
          message: "Weekly overtime limit reached. Cannot fulfill as Express.",
        };
      }

      const dailyOvertimeCapacity = kapasitasLemburPerJam * maksLemburPerHari;
      if (remainingQuantity > dailyOvertimeCapacity) {
        return {
          status: "reject",
          message: `Daily overtime capacity of ${dailyOvertimeCapacity} items exceeded.`,
        };
      }

      // Accept with overtime if within daily and weekly overtime limits
      return {
        status: "accept",
        message: `Express can fulfill on ${currentDateStr} with overtime.`,
        startDate: currentDateStr,
        lastDate: currentDateStr,
        is_overtime: true,
      };
    } else {
      // Handle Regular Order
      let additionalDaysNeeded = 0;
      let canFulfillAcrossDays = false;

      while (remainingQuantity > 0 && additionalDaysNeeded <= 2) {
        const currentDateStr = currentDate.toISOString().split("T")[0];
        const existingSchedules = await prisma.jadwal.findMany({
          where: { starting_at: currentDate },
        });
        const totalOrdersForDay = existingSchedules.reduce(
          (total, schedule) => total + schedule.jumlah_pesanan,
          0
        );
        const availableCapacity = kapasitasNormalPerHari - totalOrdersForDay;

        if (availableCapacity >= remainingQuantity) {
          // Accept if there's enough capacity for the entire order on the requested day
          return {
            status: "accept",
            message: `Order can be fulfilled on ${currentDateStr}.`,
            startDate: orderDetails.date,
            lastDate: currentDateStr,
            is_overtime: false,
          };
        } else if (availableCapacity > 0) {
          // Negotiate if the requested day can only partially fulfill the order
          return {
            status: "negotiate",
            message: `Only ${availableCapacity} items can be fulfilled on ${currentDateStr}. Remaining quantity will require additional days.`,
            startDate: orderDetails.date,
            lastDate: currentDateStr,
            is_overtime: false,
          };
        }

        // Check if we can fulfill the order by spreading it across multiple days
        if (availableCapacity === 0 && additionalDaysNeeded === 0) {
          // First day has no capacity; suggest negotiating with a new start date
          canFulfillAcrossDays = true;
        }

        if (remainingQuantity <= 0) break;

        // Move to the next day
        additionalDaysNeeded += 1;
        currentDate.setDate(currentDate.getDate() + 1);
      }

      // Final decision for regular orders after checking multiple days
      if (remainingQuantity > 0 && canFulfillAcrossDays) {
        return {
          status: "negotiate",
          message: `Full capacity not available on the requested date. Can fulfill starting from ${
            initialDate.toISOString().split("T")[0]
          } and across multiple days if needed.`,
          startDate: initialDate.toISOString().split("T")[0],
          lastDate: currentDate.toISOString().split("T")[0],
          is_overtime: false,
        };
      }

      return {
        status: "reject",
        message: "Capacity is full over the next three days. Order rejected.",
        startDate: null,
        lastDate: null,
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
