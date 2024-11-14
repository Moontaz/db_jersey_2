import prisma from "../../../lib/prisma";

export default async function handler(req, res) {
  const { id } = req.query;

  if (req.method === "GET") {
    const pesanan = await prisma.pesanan.findUnique({
      where: { id_pesanan: parseInt(id) },
    });
    res.json(pesanan);
  } else if (req.method === "PUT") {
    const { nama_pelanggan, no_hp, id_layanan, jumlah_pesanan, tanggal_masuk } =
      req.body;
    const updatedPesanan = await prisma.pesanan.update({
      where: { id_pesanan: parseInt(id) },
      data: {
        nama_pelanggan,
        no_hp,
        id_layanan,
        jumlah_pesanan,
        tanggal_masuk: new Date(tanggal_masuk),
      },
    });
    res.json(updatedPesanan);
  } else if (req.method === "DELETE") {
    await prisma.pesanan.delete({ where: { id_pesanan: parseInt(id) } });
    res.status(204).end();
  } else {
    res.status(405).json({ message: "Method not allowed" });
  }
}
