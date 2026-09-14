import express, { Application, Request, Response } from "express";
import dotenv from "dotenv";

dotenv.config();

const app: Application = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());

interface Peserta {
  id: number;
  nama: string;
  sekolah: string;
}

interface PesertaBody {
  nama: string;
  sekolah: string;
}

const dataPeserta: Peserta[] = [
  { id: 1, nama: "Andi", sekolah: "SMK 1" },
  { id: 2, nama: "Budi", sekolah: "SMK 2" },
  { id: 3, nama: "Citra", sekolah: "SMK 3" },
  { id: 4, nama: "Dewi", sekolah: "SMK 4" },
];

let nextId = 5;

app.get("/", (req: Request, res: Response) => {
  res.json({ pesan: "API Magang Batch 4 berjalan" });
});

app.get("/info", (req: Request, res: Response) => {
  res.json({
    nama: "API Magang Batch 4",
    versi: "1.0.0",
    environment: process.env.NODE_ENV || "development",
  });
});

app.get("/health", (req: Request, res: Response) => {
  res.json({
    status: "ok",
    uptime: process.uptime(),
    waktu: new Date().toISOString(),
  });
});

app.get("/peserta", (req: Request, res: Response) => {
  const sekolah = req.query.sekolah as string | undefined;

  let hasil = dataPeserta;
  if (sekolah) {
    hasil = dataPeserta.filter(
      (p) => p.sekolah.toLowerCase() === sekolah.toLowerCase()
    );
  }

  res.json(hasil);
});

app.get(
  "/peserta/:id",
  (req: Request<{ id: string }>, res: Response) => {
    const id = Number(req.params.id);
    const peserta = dataPeserta.find((p) => p.id === id);

    if (!peserta) {
      res.status(404).json({ pesan: "Peserta tidak ditemukan" });
      return;
    }

    res.json(peserta);
  }
);

app.post(
  "/peserta",
  (req: Request<{}, {}, PesertaBody>, res: Response) => {
    const { nama, sekolah } = req.body;

    if (!nama || nama.trim() === "") {
      res.status(400).json({ error: "Nama tidak boleh kosong" });
      return;
    }

    const pesertaBaru: Peserta = {
      id: nextId++,
      nama: nama.trim(),
      sekolah: sekolah?.trim() ?? "",
    };

    dataPeserta.push(pesertaBaru);
    res.status(201).json({ sukses: true, data: pesertaBaru });
  }
);

app.delete(
  "/peserta/:id",
  (req: Request<{ id: string }>, res: Response) => {
    const id = Number(req.params.id);
    const index = dataPeserta.findIndex((p) => p.id === id);

    if (index === -1) {
      res.status(404).json({ error: `Peserta dengan id ${id} tidak ditemukan` });
      return;
    }

    dataPeserta.splice(index, 1);
    res.status(204).end();
  }
);

app.listen(PORT, () => {
  console.log(`Server berjalan di http://localhost:${PORT}`);
});

// SOAL 5 — Perbandingan
// server-manual.ts : 130 baris total, ~98 baris kode aktif
// index.ts (Express): 118 baris total, ~92 baris kode aktif
// Selisih baris total: 12 baris | selisih baris kode aktif: 6 baris
// - Parsing body JSON: 31 baris manual → 1 baris (express.json())
// - Parsing query string: 2 baris manual → langsung req.query.sekolah
// - Tidak perlu helper sendJSON sendiri