export class BaseRepository<T extends { id: number }> {
  protected data: T[] = [];
  private nextId = 1;

  protected seed(initialData: T[]): void {
    this.data = [...initialData];
    const maxId = this.data.reduce((max, item) => Math.max(max, item.id), 0);
    this.nextId = maxId + 1;
  }

  findAll(): T[] {
    return this.data;
  }
  findById(id: number): T | undefined {
    return this.data.find((item) => item.id === id);
  }
  create(payload: Omit<T, "id">): T {
    const item = { id: this.nextId++, ...payload } as T;
    this.data.push(item);
    return item;
  }
  update(id: number, payload: Partial<Omit<T, "id">>): T | undefined {
    const index = this.data.findIndex((item) => item.id === id);
    if (index === -1) return undefined;
    this.data[index] = { ...this.data[index], ...payload };
    return this.data[index];
  }
  delete(id: number): boolean {
    const index = this.data.findIndex((item) => item.id === id);
    if (index === -1) return false;
    this.data.splice(index, 1);
    return true;
  }
}