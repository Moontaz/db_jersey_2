import prisma from "../../../lib/prisma";

export default async function handler(req, res) {
  try {
    if (req.method === "GET") {
      try {
        const pesanan = await prisma.pesanan.findMany();
        return res.status(200).json(pesanan);
      } catch (getError) {
        console.error("Error fetching data in GET request:", getError);
        return res.status(500).json({ error: "Failed to fetch pesanan" });
      }
    } else if (req.method === "POST") {
      const {
        nama_pelanggan,
        no_hp,
        id_layanan,
        jumlah_pesanan,
        tanggal_masuk,
        keterangan,
      } = req.body;

      if (!nama_pelanggan || !no_hp || !id_layanan || !jumlah_pesanan) {
        console.error("Missing required fields:", {
          nama_pelanggan,
          no_hp,
          id_layanan,
          jumlah_pesanan,
        });
        return res.status(400).json({ error: "Missing required fields" });
      }

      try {
        // Fetch all necessary variable values
        const variabelRecords = await prisma.variabel.findMany();
        const variabelData = variabelRecords.reduce((acc, item) => {
          acc[item.nama_variabel] = item.nilai_variabel;
          return acc;
        }, {});

        const kapasitasNormalPerHari =
          variabelData["kapasitas_normal_per_hari"] || 100;
        const kapasitasLemburPerJam =
          variabelData["kapasitas_lembur_per_jam"] || 11;
        const maksLemburPerHari = variabelData["maks_lembur_per_hari"] || 4;
        const maksLemburPerMinggu =
          variabelData["maks_lembur_per_minggu"] || 18;

        const initialDate = new Date(tanggal_masuk);
        if (isNaN(initialDate.getTime())) {
          console.error(
            "Invalid date format for tanggal_masuk:",
            tanggal_masuk
          );
          return res
            .status(400)
            .json({ error: "Invalid date format for tanggal_masuk" });
        }

        // Check if service type is "Express"
        const serviceType = await prisma.jenis_layanan.findUnique({
          where: { id_layanan: parseInt(id_layanan) },
          select: { nama_layanan: true },
        });

        const isExpress = serviceType?.nama_layanan.toLowerCase() === "express";
        let remainingQuantity = parseInt(jumlah_pesanan);
        let currentDate = new Date(initialDate);
        let lastDate = null;

        const newPesanan = await prisma.$transaction(async (prisma) => {
          const pesanan = await prisma.pesanan.create({
            data: {
              nama_pelanggan,
              no_hp,
              id_layanan: parseInt(id_layanan),
              jumlah_pesanan: parseInt(jumlah_pesanan),
              tanggal_masuk: initialDate,
              keterangan: keterangan || "",
              status_pesanan: "pending",
            },
          });

          while (remainingQuantity > 0) {
            const currentDateStr = currentDate.toISOString().split("T")[0];

            // Fetch existing schedules for the current date
            const existingSchedules = await prisma.jadwal.findMany({
              where: { starting_at: currentDate },
            });
            const totalOrdersForDay = existingSchedules.reduce(
              (total, schedule) => total + schedule.jumlah_pesanan,
              0
            );

            const availableCapacity =
              kapasitasNormalPerHari - totalOrdersForDay;
            let quantityForToday;

            if (isExpress) {
              // Express service logic: try to fit within the current day
              if (availableCapacity >= remainingQuantity) {
                quantityForToday = remainingQuantity;
                remainingQuantity = 0;
                lastDate = currentDateStr;
              } else {
                // Check weekly and daily overtime limits for Express
                const startOfWeek = new Date(currentDate);
                startOfWeek.setDate(
                  startOfWeek.getDate() - startOfWeek.getDay()
                );
                const endOfWeek = new Date(startOfWeek);
                endOfWeek.setDate(endOfWeek.getDate() + 6);

                const weeklyOvertimeSchedules = await prisma.jadwal.findMany({
                  where: {
                    starting_at: { gte: startOfWeek, lte: endOfWeek },
                    is_overtime: true,
                  },
                });
                const totalOvertimeHoursThisWeek =
                  weeklyOvertimeSchedules.reduce(
                    (total, schedule) =>
                      total + schedule.jumlah_pesanan / kapasitasLemburPerJam,
                    0
                  );

                if (totalOvertimeHoursThisWeek >= maksLemburPerMinggu) {
                  throw new Error(
                    "Weekly overtime limit reached for Express service."
                  );
                }

                const dailyOvertimeCapacity =
                  kapasitasLemburPerJam * maksLemburPerHari;
                if (remainingQuantity <= dailyOvertimeCapacity) {
                  quantityForToday = remainingQuantity;
                  remainingQuantity = 0;
                  lastDate = currentDateStr;
                  await prisma.jadwal.create({
                    data: {
                      id_pesanan: pesanan.id_pesanan,
                      jumlah_pesanan: quantityForToday,
                      starting_at: currentDate,
                      is_overtime: true,
                    },
                  });
                  break;
                } else {
                  throw new Error(
                    "Daily overtime capacity exceeded for Express service."
                  );
                }
              }
            } else {
              // Standard service logic with normal and overtime options
              quantityForToday = Math.min(remainingQuantity, availableCapacity);
              remainingQuantity -= quantityForToday;
              lastDate = currentDateStr;

              // Insert normal schedule entry for the day
              await prisma.jadwal.create({
                data: {
                  id_pesanan: pesanan.id_pesanan,
                  jumlah_pesanan: quantityForToday,
                  starting_at: currentDate,
                  is_overtime: false,
                },
              });
            }

            currentDate.setDate(currentDate.getDate() + 1);
          }

          return pesanan;
        });

        return res.status(201).json(newPesanan);
      } catch (postError) {
        console.error("Error in POST request:", postError);
        return res
          .status(500)
          .json({ error: postError.message || "Failed to create pesanan" });
      }
    } else {
      res.setHeader("Allow", ["GET", "POST"]);
      res.status(405).json({ message: "Method not allowed" });
    }
  } catch (error) {
    console.error("Unexpected error in /api/pesanan handler:", error);
    res.status(500).json({ error: "Failed to process request" });
  }
}
