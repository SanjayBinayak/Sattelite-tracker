import express from "express";
import { spawn } from "child_process";
import "dotenv/config";

const app = express();
const PORT = 3000;

app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    next();
});

app.get("/api/tle", (req, res) => {
    const pythonProcess = spawn("python", ["-u", "./src/fetch-tle.py"]);

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

    const pythonProcess = spawn("python", ["-u", "./src/fetch-tle.py", norad]);

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


app.listen(PORT, () => {
    console.log(`Backend running at http://localhost:${PORT}/api/tle`);
});