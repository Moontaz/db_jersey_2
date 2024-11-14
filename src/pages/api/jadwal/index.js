import prisma from "../../../lib/prisma";

export default async function handler(req, res) {
  if (req.method === "GET") {
    const jadwal = await prisma.jadwal.findMany();
    res.json(jadwal);
  } else if (req.method === "POST") {
    const { id_pesanan, jumlah_pesanan, starting_at } = req.body;
    const newJadwal = await prisma.jadwal.create({
      data: {
        id_pesanan,
        jumlah_pesanan,
        starting_at: new Date(starting_at),
      },
    });
    res.status(201).json(newJadwal);
  } else {
    res.status(405).json({ message: "Method not allowed" });
  }
}
