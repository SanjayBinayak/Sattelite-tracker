import express from "express";
import { spawn } from "child_process";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
const PORT = process.env.PORT || 3001;

// Render builds the frontend into ./dist (vite build output)
const DIST_DIR = path.join(__dirname, "dist");

app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    next();
});

app.use(express.static(DIST_DIR));

app.get("/api/tle", (req, res) => {
    const pythonProcess = spawn("python3", ["-u", "./src/fetch-tle.py"]);

    let stdout = "";
    let stderr = "";

    pythonProcess.stdout.on("data", (data) => {
        stdout += data.toString();
    });

    pythonProcess.stderr.on("data", (data) => {
        stderr += data.toString();
    });

    pythonProcess.on("close", (code) => {
        if (code !== 0) {
            return res.status(500).json({
                error: stderr || `Python exited with code ${code}`
            });
        }

        try {
            const satellites = JSON.parse(stdout);
            res.json(satellites);
        } catch (err) {
            console.error("Python output:");
            console.error(stdout);

            res.status(500).json({
                error: "Failed to parse JSON from Python",
                details: err.message
            });
        }
    });
});

app.get("/api/tle/:norad", (req, res) => {
    const norad = req.params.norad;

    if (!/^\d+$/.test(norad)) {
        return res.status(400).json({ error: "NORAD ID must be numeric" });
    }

    const pythonProcess = spawn("python3", ["-u", "./src/fetch-tle.py", norad]);

    let stdout = "";
    let stderr = "";

    pythonProcess.stdout.on("data", (data) => {
        stdout += data.toString();
    });

    pythonProcess.stderr.on("data", (data) => {
        stderr += data.toString();
    });

    pythonProcess.on("close", (code) => {
        if (code !== 0) {
            return res.status(500).json({
                error: stderr || `Python exited with code ${code}`
            });
        }

        try {
            const satellites = JSON.parse(stdout);

            if (!satellites || satellites.length === 0) {
                return res.status(404).json({ error: `No satellite found for NORAD ID ${norad}` });
            }

            res.json(satellites);
        } catch (err) {
            console.error("Python output:");
            console.error(stdout);

            res.status(500).json({
                error: "Failed to parse JSON from Python",
                details: err.message
            });
        }
    });
});


// Serve the SPA for any non-API route
app.get(/^\/(?!api).*/, (req, res) => {
    res.sendFile(path.join(DIST_DIR, "index.html"));
});

app.listen(PORT, "0.0.0.0", () => {
    console.log(`Backend running at http://0.0.0.0:${PORT}/api/tle`);
});