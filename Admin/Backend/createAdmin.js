const bcrypt = require("bcrypt");
const pool = require("./db");

(async () => {
  const hash = await bcrypt.hash("1234", 10);

  await pool.query(
    "INSERT INTO users (username, password_hash, role) VALUES ($1,$2,$3)",
    ["admin", hash, "admin"]
  );

  console.log("✅ Admin user created");
  process.exit();
})();
