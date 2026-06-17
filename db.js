const { Pool } = require("pg");
require("dotenv").config();

// ნეონის ბაზას პირდაპირ ამ ერთი ხაზით ვუკავშირდებით
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false // ეს სავალდებულოა ონლაინ ბაზებისთვის (უსაფრთხოებისთვის)
  }
});

module.exports = pool;