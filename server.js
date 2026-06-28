import express from "express";
import { spawn } from "child_process";
import path from "path";
import { fileURLToPath } from "url";
import "dotenv/config";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;
const DIST_DIR = path.join(__dirname, "dist");

app.use(express.json());

app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    next();
});

// ---------------------
// Helper to execute Python
// ---------------------
function runPython(args = []) {
    return new Promise((resolve, reject) => {
        const python = spawn("python3", [
            "-u",
            path.join(__dirname, "src", "fetch-tle.py"),
            ...args,
        ]);

        let stdout = "";
        let stderr = "";

        python.stdout.on("data", (d) => {
            stdout += d.toString();
        });

        python.stderr.on("data", (d) => {
            stderr += d.toString();
        });

        python.on("close", (code) => {
            if (code !== 0) {
                reject(new Error(stderr || `Python exited with code ${code}`));
                return;
            }

            try {
                resolve(JSON.parse(stdout));
            } catch (err) {
                reject(
                    new Error(
                        `Invalid JSON from Python\n${stdout}\n\n${err.message}`
                    )
                );
            }
        });
    });
}

// ---------------------
// API
// ---------------------

app.get("/api/tle", async (req, res) => {
    try {
        const satellites = await runPython();
        res.json(satellites);
    } catch (err) {
        console.error(err);
        res.status(500).json({
            error: err.message,
        });
    }
});

app.get("/api/tle/:norad", async (req, res) => {
    const { norad } = req.params;

    if (!/^\d+$/.test(norad)) {
        return res.status(400).json({
            error: "NORAD ID must be numeric",
        });
    }

    try {
        const satellites = await runPython([norad]);

        if (!satellites.length) {
            return res.status(404).json({
                error: "Satellite not found",
            });
        }

        res.json(satellites);
    } catch (err) {
        console.error(err);
        res.status(500).json({
            error: err.message,
        });
    }
});

// ---------------------
// Frontend
// ---------------------

app.use(express.static(DIST_DIR));

app.get("/{*path}", (req, res, next) => {
    if (req.path.startsWith("/api")) {
        return next();
    }

    res.sendFile(path.join(DIST_DIR, "index.html"));
});

// ---------------------
// Start server
// ---------------------

app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`Frontend: http://0.0.0.0:${PORT}`);
    console.log(`API:      http://0.0.0.0:${PORT}/api/tle`);
});