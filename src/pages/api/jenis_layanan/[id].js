import prisma from "../../../lib/prisma";

export default async function handler(req, res) {
  const { id } = req.query;

  if (req.method === "GET") {
    const jenisLayanan = await prisma.jenis_layanan.findUnique({
      where: { id_layanan: parseInt(id) },
    });
    res.json(jenisLayanan);
  } else if (req.method === "PUT") {
    const { nama_layanan, estimasi_waktu, harga } = req.body;
    const updatedJenisLayanan = await prisma.jenis_layanan.update({
      where: { id_layanan: parseInt(id) },
      data: {
        nama_layanan,
        estimasi_waktu,
        harga,
      },
    });
    res.json(updatedJenisLayanan);
  } else if (req.method === "DELETE") {
    await prisma.jenis_layanan.delete({ where: { id_layanan: parseInt(id) } });
    res.status(204).end();
  } else {
    res.status(405).json({ message: "Method not allowed" });
  }
}
