// clearMocks di jest.config hanya menghapus riwayat panggilan. Jawaban yang diatur lewat
// mockResolvedValue / mockRejectedValue TETAP BERTAHAN ke test berikutnya.
// Helper ini menghapus keduanya, supaya tiap test mulai dari maket yang bersih.
export function resetMockObjek(...objek: object[]): void {
  for (const o of objek) {
    for (const nilai of Object.values(o)) {
      if (typeof nilai === "function" && "mockReset" in nilai) {
        (nilai as jest.Mock).mockReset();
      }
    }
  }
}