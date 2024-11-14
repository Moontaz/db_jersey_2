import prisma from "../../../lib/prisma";

export default async function handler(req, res) {
  if (req.method === "GET") {
    const variabel = await prisma.variabel.findMany();
    res.json(variabel);
  } else if (req.method === "POST") {
    const { nama_variabel, nilai_variabel } = req.body;
    const newVariabel = await prisma.variabel.create({
      data: {
        nama_variabel,
        nilai_variabel,
      },
    });
    res.status(201).json(newVariabel);
  } else {
    res.status(405).json({ message: "Method not allowed" });
  }
}
