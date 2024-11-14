export const checkCapacity = async (orderDetails, variabelData) => {
  try {
    console.log("Checking capacity for initial date:", orderDetails.date);
    const quantity = parseInt(orderDetails.quantity);
    const kapasitasNormalPerHari =
      variabelData["kapasitas_normal_per_hari"] || 100;

    // Set up initial date and verify it's valid
    let initialDate = new Date(orderDetails.date);
    if (isNaN(initialDate.getTime())) {
      throw new Error("Invalid initial date in order details.");
    }
    const type = orderDetails.serviceName.lowercase;
    if (orderDetails.serviceName === "Express") {
      //add code for handling express here
    }

    // Get the existing orders for the initial date
    let currentDate = initialDate;
    let remainingQuantity = quantity;
    let additionalDaysNeeded = 0;
    let lastDate = null; // Track the last date used to fulfill the order

    // Start looping until the entire quantity is scheduled or we reach the max additional days allowed
    while (
      remainingQuantity > 0 &&
      additionalDaysNeeded <= variabelData["maks_lembur_per_minggu"]
    ) {
      const currentDateStr = currentDate.toISOString().split("T")[0];

      // Fetch existing schedules for the current date
      const response = await fetch(`/api/jadwal?date=${currentDateStr}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch schedule for ${currentDateStr}.`);
      }

      const existingSchedules = await response.json();
      const totalOrdersForDay = existingSchedules.reduce(
        (total, schedule) => total + schedule.jumlah_pesanan,
        0
      );

      // Calculate available capacity for the current day
      const availableCapacity = kapasitasNormalPerHari - totalOrdersForDay;
      console.log(
        `Date: ${currentDateStr}, Total Orders for Day: ${totalOrdersForDay}, Available Capacity: ${availableCapacity}`
      );

      if (availableCapacity > 0) {
        // Determine how much can be allocated to this day
        const quantityForToday = Math.min(remainingQuantity, availableCapacity);
        remainingQuantity -= quantityForToday;
        lastDate = currentDateStr; // Update lastDate to the current date as it is used to fulfill the order

        console.log(
          `Allocating ${quantityForToday} units on ${currentDateStr}, Remaining Quantity: ${remainingQuantity}`
        );

        // If the entire quantity is scheduled within the days considered, accept the order
        if (remainingQuantity === 0) {
          return {
            status: "accept",
            message: `Order can be fulfilled and completed by ${lastDate}.`,
            startDate: orderDetails.date,
            lastDate, // Set lastDate to the last date used
          };
        }
      }

      // Move to the next day
      additionalDaysNeeded += 1;
      currentDate.setDate(currentDate.getDate() + 1);
    }

    // If we exit the loop and remainingQuantity > 0, we need to reject or handle partially
    if (remainingQuantity > 0) {
      console.log("Order requires more days than available capacity allows.");
      return {
        status: "reject",
        message: "Capacity is full. Order rejected.",
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

export const handleConfirmOrder = async (orderDetails, startDate) => {
  try {
    console.log("Order details:", orderDetails);
    const response = await fetch("/api/pesanan", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nama_pelanggan: orderDetails.customerName,
        no_hp: orderDetails.phoneNumber,
        id_layanan: parseInt(orderDetails.service),
        jumlah_pesanan: parseInt(orderDetails.quantity),
        tanggal_masuk: startDate,
        keterangan: orderDetails.note || "",
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to insert order data");
    }

    const result = await response.json();
    console.log("Order confirmed:", result);
    return result;
  } catch (error) {
    console.error("Error in handleConfirmOrder:", error);
    throw error;
  }
};
