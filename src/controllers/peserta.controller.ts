import { Request, Response } from "express";
import { dataPeserta } from "../data/dummy";
import { dataJurnal } from "../data/dummy"; 

export const getSemuaPeserta = (req: Request, res: Response): void => {
  const { sekolah, fase, limit } = req.query;
  let hasil = dataPeserta;

  if (sekolah) {
    hasil = hasil.filter((p) => p.sekolah.includes(String(sekolah)));
  }
  if (fase) {
    hasil = hasil.filter((p) => p.fase === Number(fase));
  }
  if (limit) {
    hasil = hasil.slice(0, Number(limit));
  }

  res.json({ total: hasil.length, data: hasil });
};

export const getPesertaById = (req: Request, res: Response): void => {
  const id = Number(req.params.id);
  const peserta = dataPeserta.find((p) => p.id === id);

  if (!peserta) {
    res.status(404).json({ error: `Peserta dengan id ${id} tidak ditemukan` });
    return; 
  }

  res.json(peserta);
};

export const getJurnalByPesertaId = (req: Request, res: Response): void => {
  const pesertaId = Number(req.params.id);

  const peserta = dataPeserta.find((p) => p.id === pesertaId);
  if (!peserta) {
    res.status(404).json({ error: `Peserta dengan id ${pesertaId} tidak ditemukan` });
    return;
  }

  const hasil = dataJurnal.filter((j) => j.pesertaId === pesertaId);

  res.json({ pesertaId, nama: peserta.nama, total: hasil.length, data: hasil });
};

export const buatPeserta = (req: Request, res: Response): void => {
  const { nama, sekolah, fase } = req.body;

  if (!nama || !sekolah) {
    res.status(400).json({ error: "nama dan sekolah wajib diisi" });
    return;
  }

  const baru = {
    id: dataPeserta.length + 1,
    nama,
    sekolah,
    fase: Number(fase) || 1,
  };
  dataPeserta.push(baru);
  res.status(201).json(baru);
};

export const updatePeserta = (req: Request, res: Response): void => {
  const id = Number(req.params.id);
  const index = dataPeserta.findIndex((p) => p.id === id);

  if (index === -1) {
    res.status(404).json({ error: `Peserta dengan id ${id} tidak ditemukan` });
    return;
  }

  dataPeserta[index] = { ...dataPeserta[index], ...req.body };
  res.json(dataPeserta[index]);
};

export const hapusPeserta = (req: Request, res: Response): void => {
  const id = Number(req.params.id);
  const index = dataPeserta.findIndex((p) => p.id === id);

  if (index === -1) {
    res.status(404).json({ error: `Peserta dengan id ${id} tidak ditemukan` });
    return;
  }

  dataPeserta.splice(index, 1);
  res.status(204).send();
};