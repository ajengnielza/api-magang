import { Request, Response } from "express";
import { dataJurnal, increaseNextJurnalId } from "../data/dummy";   

export const getSemuaJurnal = (req: Request, res: Response): void => {
  const { peserta, status } = req.query;
  let hasil = dataJurnal;

  if (peserta) {
    hasil = hasil.filter((j) => j.pesertaId === Number(peserta));
  }
  if (status) {
    hasil = hasil.filter((j) => j.status === status);
  }

  res.json({ total: hasil.length, data: hasil });
};

export const getJurnalById = (req: Request, res: Response): void => {
  const id = Number(req.params.id);
  const jurnal = dataJurnal.find((j) => j.id === id);

  if (!jurnal) {
    res.status(404).json({ error: `Jurnal dengan id ${id} tidak ditemukan` });
    return;
  }
  res.json(jurnal);
};

export const buatJurnal = (req: Request, res: Response): void => {
  const { pesertaId, tanggal, kegiatan, status } = req.body;
  const baru = {
    id: increaseNextJurnalId(),  
    pesertaId: Number(pesertaId),
    tanggal,
    kegiatan,
    status: status ?? "belum",
  };
  dataJurnal.push(baru);
  res.status(201).json(baru);
};

export const updateJurnal = (req: Request, res: Response): void => {
  const id = Number(req.params.id);
  const index = dataJurnal.findIndex((j) => j.id === id);

  if (index === -1) {
    res.status(404).json({ error: `Jurnal dengan id ${id} tidak ditemukan` });
    return;
  }
  dataJurnal[index] = { ...dataJurnal[index], ...req.body };
  res.json(dataJurnal[index]);
};

export const hapusJurnal = (req: Request, res: Response): void => {
  const id = Number(req.params.id);
  const index = dataJurnal.findIndex((j) => j.id === id);

  if (index === -1) {
    res.status(404).json({ error: `Jurnal dengan id ${id} tidak ditemukan` });
    return;
  }
  dataJurnal.splice(index, 1);
  res.status(204).send();
};