import express from "express";
import cors from "cors";
import { promises as fs } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Serve static files from /public
app.use(express.static(path.join(__dirname, "public")));

// Serve index.html from root
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// Force APK download
app.get("/download-apk", (req, res) => {
  const apkPath = path.join(__dirname, "public", "EcoPathApp.apk");
  res.download(apkPath, "EcoPathApp.apk");
});

// API endpoints
const DATA_PATH = path.join(__dirname, "data.json");

async function readData() {
  const raw = await fs.readFile(DATA_PATH, "utf8");
  return JSON.parse(raw);
}

app.get("/api/stats", async (_req, res) => {
  try {
    res.json(await readData());
  } catch (err) {
    res.status(500).json({ error: "Unable to load stats" });
  }
});

app.get("/api/stats/:type", async (req, res) => {
  try {
    const data = await readData();
    const typeKey = `${req.params.type}Stats`;
    if (!data[typeKey]) return res.status(404).json({ error: "Invalid type" });
    res.json(data[typeKey]);
  } catch {
    res.status(500).json({ error: "Unable to load stats" });
  }
});

app.listen(PORT, () => console.log(`✅ Running at http://localhost:${PORT}`));
