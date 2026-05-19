const mysql = require("mysql2");
const express = require("express");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const fs = require('fs');
const path = require('path');


const ENCRYPTION_KEY = crypto.randomBytes(32);
const IV = crypto.randomBytes(16);
function encrypt(text) {
    const cipher = crypto.createCipheriv('aes-256-cbc', ENCRYPTION_KEY, IV);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return encrypted;
}

const app = express();
const port = process.env.PORT || 3000;
// Increase body size limit
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true, limit: '5mb' }))

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(express.static(path.join(__dirname, "public")));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

require('dotenv').config();

const database = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT
});

database.connect((err) => {
    if (err) {
        console.log("Connection failed", err);
    } else {
        console.log("Connected to MySQL");
    }
});

// User Signup
app.post("/signup", (req, res) => {
    const { name, email, password, confirm } = req.body;
    if (password !== confirm) {
        return res.send("Passwords do not match.");
    }

    const hashPassword = bcrypt.hashSync(password, 10);
    const q = "INSERT INTO users (name, email, password) VALUES (?, ?, ?)";
    const values = [name, email, hashPassword];

    database.query(q, values, (err, result) => {
        if (err) {
            console.error("Error inserting user:", err);
            res.status(500).send("Signup failed.");
        } else {
            res.redirect("/login.html");
        }
    });
});

// User Login
app.post("/login", (req, res) => {
    const { email, password } = req.body;

    const q = "SELECT * FROM users WHERE email = ?";
    database.query(q, [email], (err, results) => {
        if (err || results.length === 0) {
            return res.send("Invalid login, No User Exists");
        }

        const user = results[0];
        const passwordMatch = bcrypt.compareSync(password, user.password);

        if (passwordMatch) {
            console.log("Login successful for:", user.email);
            const encryptedEmail = encrypt(user.email);
            console.log(`Encrypted email: ${encryptedEmail}`);
            res.redirect("/dashboard.html");
        } else {
            res.send("Wrong password.");
        }
    });
});

// Generate Pass (with photo upload)
app.post("/generate-pass", (req, res) => {
    const {
        name, mobile, organization, address, designation,
        country, officer_name, officer_designation, purpose, photo
    } = req.body;

    // let photoPath = null;
      const base64Data = photo.replace(/^data:image\/png;base64,/, "");
      const fileName = `visitor_${Date.now()}.png`;
      const filePath = path.join(__dirname, "uploads", fileName);

    fs.writeFile(filePath, base64Data, "base64", (err) => {
    if (err) {
      console.error("Error saving photo:", err);
      return res.status(500).send("Error saving photo");
    }
    
    const q = `
        INSERT INTO visitors (
            name, mobile, organization, address,
            designation, country, purpose,
            officer_name, officer_designation, photo_path
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
        name, mobile, organization, address,
        designation, country, purpose,
        officer_name, officer_designation, fileName
    ];

    database.query(q, values, (err, result) => {
        if (err) {
            console.error("Error inserting visitor:", err);
            return res.status(500).send("Failed to generate pass");
        }
        res.redirect(`/visitor-pass.html?id=${result.insertId}`);
    });
});
});

// Fetch Today’s Visitors
app.get("/api/today-visitors", (req, res) => {
    const q = "SELECT * FROM visitors WHERE DATE(in_time) = CURDATE()";
    database.query(q, (err, results) => {
        if (err) {
            console.error("Error fetching visitors:", err);
            return res.status(500).json({ error: "DB error" });
        }
        res.json(results);
    });
});

// Fetch Visitor Summary
app.get("/api/visitor-summary", (req, res) => {
    const q = "SELECT * FROM visitors ORDER BY in_time DESC";
    database.query(q, (err, results) => {
        if (err) {
            console.error("Error fetching summary:", err);
            return res.status(500).json({ error: "DB error" });
        }
        res.json(results);
    });
});

// Fetch Individual Visitor by ID
app.get("/api/visitor/:id", (req, res) => {
  const visitorId = req.params.id;
  const q = "SELECT * FROM visitors WHERE id = ?";

  database.query(q, [visitorId], (err, results) => {
    if (err) {
      console.error("Error fetching visitor:", err);
      return res.status(500).json({ error: "Failed to fetch visitor" });
    }
    if (results.length === 0) {
      return res.status(404).json({ error: "Visitor not found" });
    }

    const visitor = results[0];

    if (visitor.photo_path && !visitor.photo_path.startsWith("/uploads/")) {
      visitor.photo_path = "/uploads/" + visitor.photo_path;
    }

    res.json(visitor);
  });
});
// // Patch Punch Out (update out_time for a visitor)
app.patch('/api/visitor-punchout/:id', (req, res) => {
    const visitorId = req.params.id;
    const q = "UPDATE visitors SET out_time = NOW() WHERE id = ?";
    database.query(q, [visitorId], (err, result) => {
        if (err) {
            console.error("Error updating punch out:", err);
            return res.status(500).json({ error: "DB update failed" });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "No visitor found" });
        }
        res.json({ success: true });
    });
});

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "signup.html"));
});

// Start Server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});

