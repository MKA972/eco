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
app.use(express.static(__dirname));

const DATA_PATH = path.join(__dirname, "data.json");

async function readData() {
  const raw = await fs.readFile(DATA_PATH, "utf8");
  return JSON.parse(raw);
}

function sendServerError(res, error) {
  console.error("Failed to load stats:", error);
  res.status(500).json({ error: "Unable to load stats" });
}

app.get("/api/stats", async (_req, res) => {
  try {
    const data = await readData();
    res.json(data);
  } catch (error) {
    sendServerError(res, error);
  }
});

app.get("/api/stats/:type", async (req, res) => {
  try {
    const data = await readData();
    const typeKey = `${req.params.type}Stats`;
    if (!Object.prototype.hasOwnProperty.call(data, typeKey)) {
      return res.status(404).json({ error: "Invalid type" });
    }
    res.json(data[typeKey]);
  } catch (error) {
    sendServerError(res, error);
  }
});

app.listen(PORT, () => console.log(`✅ EcoPath running at http://localhost:${PORT}`));
