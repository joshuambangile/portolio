require("dotenv").config();
const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const portfolio = require("./data/portfolio");

const app = express();
const PORT = process.env.PORT || 5000;

const contactsFile = path.join(__dirname, "data", "contacts.json");

// Ensure contacts file exists
try {
  if (!fs.existsSync(contactsFile)) {
    fs.writeFileSync(contactsFile, JSON.stringify([]), "utf8");
  }
} catch (err) {
  console.error("Failed to ensure contacts file:", err);
}

async function readContacts() {
  try {
    const raw = await fs.promises.readFile(contactsFile, "utf8");
    return JSON.parse(raw || "[]");
  } catch (err) {
    return [];
  }
}

async function writeContacts(arr) {
  await fs.promises.writeFile(contactsFile, JSON.stringify(arr, null, 2), "utf8");
}

const allowedOrigins = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(null, true);
      }
    },
  })
);
app.use(express.json());

app.get("/", (_req, res) => {
  res.json({
    message: "Ambangile Portfolio API",
    endpoints: ["/api/health", "/api/portfolio", "/api/contact"],
  });
});

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.get("/api/portfolio", (_req, res) => {
  res.json(portfolio);
});

app.post("/api/contact", (req, res) => {
  const { name, email, message } = req.body || {};

  if (!name || !email || !message) {
    return res.status(400).json({
      success: false,
      error: "Name, email, and message are required.",
    });
  }

  (async () => {
    try {
      const contacts = await readContacts();
      const entry = { id: Date.now(), name, email, message, sentAt: new Date().toISOString() };
      contacts.push(entry);
      await writeContacts(contacts);

      res.json({
        success: true,
        message: "Thank you for your message. Ambangile will get back to you soon.",
        received: entry,
      });
    } catch (err) {
      console.error("Failed to save contact:", err);
      res.status(500).json({ success: false, error: "Failed to save message." });
    }
  })();
});

app.get("/api/contacts", async (_req, res) => {
  try {
    const contacts = await readContacts();
    res.json({ success: true, contacts });
  } catch (err) {
    res.status(500).json({ success: false, error: "Failed to read contacts." });
  }
});

app.listen(PORT, () => {
  console.log(`Portfolio API running on port ${PORT}`);
});
