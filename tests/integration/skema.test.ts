import { AppDataSource } from "../../src/config/database.config";
import { siapkanDatabase, tutupDatabase } from "../helpers/db";

describe("skema database", () => {
  beforeAll(siapkanDatabase);
  afterAll(tutupDatabase);

  it("hasil migration sama dengan definisi entity (tidak ada perubahan tertunda)", async () => {
    // Setara dengan migration:generate yang menjawab "No changes"
    const sql = await AppDataSource.driver.createSchemaBuilder().log();

    expect(sql.upQueries.map((q) => q.query)).toEqual([]);
  });
});