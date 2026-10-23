
import "reflect-metadata";
import dotenv from "dotenv";

process.env.DOTENV_CONFIG_QUIET = "true";

dotenv.config({ path: ".env.test", quiet: true });

process.env.NODE_ENV = "test";
process.env.DB_NAME ??= "magang_test";
process.env.JWT_SECRET ??= "secret-integration-test";
process.env.JWT_REFRESH_SECRET ??= "refresh-integration-test";

// Pengaman: integration test hanya boleh memakai database khusus test.
if (!process.env.DB_NAME?.endsWith("_test")) {
  throw new Error(
    `Integration test menolak berjalan di database "${process.env.DB_NAME}". ` +
      "Nama database wajib berakhiran _test."
  );
}
