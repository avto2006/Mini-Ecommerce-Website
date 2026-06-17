const express = require("express");
const cors = require("cors");
const pool = require("./db"); // შემოგვაქვს ბაზის ხიდი db.js-დან
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

// ==========================================
// 1. ცხრილის ავტომატური შექმნა ბაზაში
// ==========================================
const createTable = async () => {
  const queryText = `
    CREATE TABLE IF NOT EXISTS products (
      id SERIAL PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      price INT NOT NULL
    );
  `;
  try {
    // აგზავნის SQL კოდს ბაზაში ცხრილის შესაქმნელად
    await pool.query(queryText);
    console.log("PostgreSQL 'products' ცხრილი მზად არის! 🗄️");
  } catch (err) {
    console.error("ცხრილის შექმნისას მოხდა შეცდომა:", err.message);
  }
};
createTable();

// ==========================================
// 2. GET: ყველა პროდუქტის წაკითხვა ბაზიდან
// ==========================================
app.get("/products", async (req, res) => {
  try {
    // ბაზას ვთხოვთ ყველა პროდუქტის წამოღებას
    const result = await pool.query("SELECT * FROM products;");
    
    // ბაზიდან წამოღებული ინფორმაცია ყოველთვის დევს result.rows-ში
    res.json(result.rows); 
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "სერვერის შეცდომა მონაცემების წაკითხვისას" });
  }
});

// ==========================================
// 3. POST: ახალი პროდუქტის ჩაწერა ბაზაში
// ==========================================
app.post("/products", async (req, res) => {
  try {
    // ამოვიღებთ სახელს და ფასს იმ მონაცემებიდან, რაც კლიენტმა გამოგვიგზავნა
    const { name, price } = req.body; 
    
    // $1 და $2 არის უსაფრთხოების "ადგილები" (Placeholders), ჰაკერებისგან დასაცავად
    const queryText = "INSERT INTO products (name, price) VALUES ($1, $2) RETURNING *;";
    const values = [name, price];
    
    // ვაგზავნით ბრძანებას და რეალურ მონაცემებს ერთად
    const result = await pool.query(queryText, values);
    
    // RETURNING * -ის წყალობით, ბაზა უკან გვიბრუნებს ახლად შექმნილ პროდუქტს (თავისი ID-ით)
    res.json({
      message: "Product added successfully",
      product: result.rows[0] 
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "სერვერის შეცდომა მონაცემის ჩაწერისას" });
  }
});

// ==========================================
// 4. DELETE: პროდუქტის წაშლა ბაზიდან ID-ით
// ==========================================
app.delete("/products/:id", async (req, res) => {
  try {
    const id = req.params.id; // ვიღებთ ID-ს URL ლინკიდან (მაგ: /products/3)
    
    // ვეუბნებით ბაზას, წაშალოს ის პროდუქტი, რომლის id უდრის $1-ს
    const queryText = "DELETE FROM products WHERE id = $1 RETURNING *;";
    const result = await pool.query(queryText, [id]);
    
    // თუ ბაზამ ვერაფერი იპოვა და ვერ წაშალა, result.rows იქნება ცარიელი
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "პროდუქტი ამ ID-ით ვერ მოიძებნა" });
    }
    
    res.json({ message: "Product deleted successfully" });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "სერვერის შეცდომა წაშლისას" });
  }
});

// ==========================================
// სერვერის პორტის ჩართვა
// ==========================================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});