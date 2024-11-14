import prisma from "../../../lib/prisma";

export default async function handler(req, res) {
  const { id } = req.query;

  if (req.method === "GET") {
    const variabel = await prisma.variabel.findUnique({
      where: { id_variabel: parseInt(id) },
    });
    res.json(variabel);
  } else if (req.method === "PUT") {
    const { nama_variabel, nilai_variabel } = req.body;
    const updatedVariabel = await prisma.variabel.update({
      where: { id_variabel: parseInt(id) },
      data: {
        nama_variabel,
        nilai_variabel,
      },
    });
    res.json(updatedVariabel);
  } else if (req.method === "DELETE") {
    await prisma.variabel.delete({ where: { id_variabel: parseInt(id) } });
    res.status(204).end();
  } else {
    res.status(405).json({ message: "Method not allowed" });
  }
}
