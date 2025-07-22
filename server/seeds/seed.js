import dotenv from "dotenv";
import bcrypt from "bcrypt";
import conn from "../db/db.js";

dotenv.config();

const seed = async () => {
  const client = await conn.connect();

  try {
    await client.query(`
      INSERT INTO categories (name) VALUES 
  ('Tech'), 
  ('Business'), 
  ('Education'), 
  ('Health'), 
  ('Entertainment'),
  ('Art'),
  ('Science'),
  ('Sports'),
  ('Music'),
  ('Finance'),
  ('Technology'),
  ('Food'),
  ('Travel'),
  ('Lifestyle')
ON CONFLICT (name) DO NOTHING;

    `);

    const email = "testuser@example.com";
    const password = "Test1234!";

    const emailCheck = await client.query(
      "SELECT * FROM users WHERE email=$1",
      [email]
    );
    if (emailCheck.rows.length === 0) {
      await client.query("BEGIN");

      const hashedPassword = await bcrypt.hash(password, 10);

      const userInsert = await client.query(
        "INSERT INTO users (email, password) VALUES ($1, $2) RETURNING id",
        [email, hashedPassword]
      );

      const userId = userInsert.rows[0].id;

      await client.query("INSERT INTO profiles (user_id) VALUES ($1)", [
        userId
      ]);

      await client.query("COMMIT");
    }
    process.exit(0);
  } catch (error) {
    await client.query("ROLLBACK");
    process.exit(1);
  } finally {
    client.release();
  }
};

seed();
