const { Pool } = require("pg");

const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "propshop_crm",
  password: "Shubh@M10SS",
  port: 5432,
});

module.exports = pool;
