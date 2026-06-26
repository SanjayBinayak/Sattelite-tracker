import express from 'express';
import { spawn } from 'child_process';

const app = express();
const PORT = 3000;

// Allow your Vite frontend to access this server without CORS blocking
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    next();
});

app.get('/api/tle', (req, res) => {
    // Note: Adjusted path to handle running server from the root folder
    const pythonProcess = spawn('python', ['-u', './src/fetch-tle.py']);
    let rawTleOutput = '';
    let errorOutput = '';

    pythonProcess.stdout.on('data', (data) => rawTleOutput += data.toString());
    pythonProcess.stderr.on('data', (data) => errorOutput += data.toString());

    pythonProcess.on('close', (code) => {
        if (errorOutput || code !== 0) {
            return res.status(500).json({ error: errorOutput || `Exit code ${code}` });
        }

        const lines = rawTleOutput.split(/\r?\n/).map(line => line.trim()).filter(line => line.length > 0);
        if (lines.length === 0) return res.json({});

        // Send out the cleanly structured lines to your browser
        res.json({
            name: "ISS (ZARYA)",
            line1: lines[0],
            line2: lines[1]
        });
    });
});

app.listen(PORT, () => console.log(`🚀 TLE Backend serving at http://localhost:${PORT}/api/tle`));
