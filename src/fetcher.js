// Cleaned up: No Node 'child_process' imports are here anymore!
export async function getTlesFromPython() {
    try {
        // Fetch the data from your new Node Express server background utility
        const response = await fetch('http://localhost:3000/api/tle');
        
        if (!response.ok) {
            throw new Error(`Server responded with status: ${response.status}`);
        }
        
        const satellite = await response.json();
        console.log("recieved data", satellite)
        return satellite; // Returns { name, line1, line2 }
    } catch (error) {
        console.error("Failed to fetch TLE from local server:", error);
        return null;
    }
}

export async function getTleByNorad(noradId) {
    try {
        const response = await fetch(`http://localhost:3000/api/tle/${noradId}`);

        if (!response.ok) {
            const body = await response.json().catch(() => ({}));
            throw new Error(body.error || `Server responded with status: ${response.status}`);
        }

        const satellites = await response.json();
        console.log("received data for NORAD", noradId, satellites);
        return satellites; // Returns [{ name, line1, line2 }]
    } catch (error) {
        console.error(`Failed to fetch TLE for NORAD ${noradId}:`, error);
        return null;
    }
}