import prisma from "../../../lib/prisma";

export default async function handler(req, res) {
  if (req.method === "GET") {
    const jenisLayanan = await prisma.jenis_layanan.findMany();
    res.json(jenisLayanan);
  } else if (req.method === "POST") {
    const { nama_layanan, estimasi_waktu, harga } = req.body;
    const newJenisLayanan = await prisma.jenis_layanan.create({
      data: {
        nama_layanan,
        estimasi_waktu,
        harga,
      },
    });
    res.status(201).json(newJenisLayanan);
  } else {
    res.status(405).json({ message: "Method not allowed" });
  }
}
