import prisma from "../../../lib/prisma";

export default async function handler(req, res) {
  const { id } = req.query;

  if (req.method === "GET") {
    const jadwal = await prisma.jadwal.findUnique({
      where: { id_jadwal: parseInt(id) },
    });
    res.json(jadwal);
  } else if (req.method === "PUT") {
    const { id_pesanan, jumlah_pesanan, starting_at } = req.body;
    const updatedJadwal = await prisma.jadwal.update({
      where: { id_jadwal: parseInt(id) },
      data: {
        id_pesanan,
        jumlah_pesanan,
        starting_at: new Date(starting_at),
      },
    });
    res.json(updatedJadwal);
  } else if (req.method === "DELETE") {
    await prisma.jadwal.delete({ where: { id_jadwal: parseInt(id) } });
    res.status(204).end();
  } else {
    res.status(405).json({ message: "Method not allowed" });
  }
}
