export const handleConfirmOrder = async (
  orderDetails,
  startDate,
  capacityResult
) => {
  try {
    // Validasi input
    if (!orderDetails || !startDate || !capacityResult) {
      throw new Error("Invalid input provided to handleConfirmOrder.");
    }

    const { lastDate, is_overtime } = capacityResult;
    const isExpress = orderDetails.serviceName.toLowerCase() === "express";
    const variabelData = await prisma.variabel.findMany();
    const variabelMap = variabelData.reduce((acc, item) => {
      acc[item.nama_variabel] = item.nilai_variabel;
      return acc;
    }, {});

    const kapasitasNormalPerHari = variabelMap["kapasitas_normal_per_hari"];
    const kapasitasLemburPerJam = variabelMap["kapasitas_lembur_per_jam"];
    const maksLemburPerHari = variabelMap["maks_lembur_per_hari"];
    const kapasitasLemburPerHari = kapasitasLemburPerJam * maksLemburPerHari;

    let remainingQuantity = parseInt(orderDetails.quantity);
    let currentDate = new Date(startDate);

    // Lewati hari Minggu
    const skipSundays = (date) => {
      while (date.getDay() === 0) {
        date.setDate(date.getDate() + 1);
      }
      return date;
    };
    currentDate = skipSundays(currentDate);

    // Simpan data pesanan ke tabel `pesanan`
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

    // Alokasikan pesanan ke jadwal harian
    while (remainingQuantity > 0) {
      const currentDateStr = currentDate.toISOString().split("T")[0];

      // Hitung kapasitas normal yang tersisa untuk hari ini
      const existingNormalSchedules = await prisma.jadwal.findMany({
        where: { starting_at: currentDate, is_overtime: false },
      });
      const totalNormalOrdersForDay = existingNormalSchedules.reduce(
        (total, schedule) => total + schedule.jumlah_pesanan,
        0
      );
      const availableNormalCapacity =
        kapasitasNormalPerHari - totalNormalOrdersForDay;

      let allocatedToNormal = 0;
      if (availableNormalCapacity > 0) {
        // Alokasikan sebanyak mungkin ke kapasitas normal
        allocatedToNormal = Math.min(
          remainingQuantity,
          availableNormalCapacity
        );

        await prisma.jadwal.create({
          data: {
            id_pesanan: pesanan.id_pesanan,
            jumlah_pesanan: allocatedToNormal,
            starting_at: currentDate,
            is_overtime: false,
          },
        });

        remainingQuantity -= allocatedToNormal;
      }

      // Hitung kapasitas lembur yang tersisa untuk hari ini
      if (remainingQuantity > 0) {
        const existingOvertimeSchedules = await prisma.jadwal.findMany({
          where: { starting_at: currentDate, is_overtime: true },
        });
        const totalOvertimeOrdersForDay = existingOvertimeSchedules.reduce(
          (total, schedule) => total + schedule.jumlah_pesanan,
          0
        );
        const availableOvertimeCapacity =
          kapasitasLemburPerHari - totalOvertimeOrdersForDay;

        if (availableOvertimeCapacity > 0) {
          // Alokasikan sisa pesanan ke lembur
          const allocatedToOvertime = Math.min(
            remainingQuantity,
            availableOvertimeCapacity
          );

          await prisma.jadwal.create({
            data: {
              id_pesanan: pesanan.id_pesanan,
              jumlah_pesanan: allocatedToOvertime,
              starting_at: currentDate,
              is_overtime: true,
            },
          });

          remainingQuantity -= allocatedToOvertime;
        }
      }

      // Jika masih ada sisa pesanan, lanjut ke hari berikutnya
      if (remainingQuantity > 0) {
        currentDate.setDate(currentDate.getDate() + 1);
        currentDate = skipSundays(currentDate);
      }
    }

    return {
      status: "success",
      message: "Order successfully saved.",
      order: pesanan,
    };
  } catch (error) {
    console.error("Error in handleConfirmOrder:", error);
    throw new Error(error.message);
  }
};
