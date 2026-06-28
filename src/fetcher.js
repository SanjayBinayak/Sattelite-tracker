// Cleaned up: No Node 'child_process' imports are here anymore!
export async function getTlesFromPython() {
    try {
        const response = await fetch('/api/tle');
        
        if (!response.ok) {
            throw new Error(`Server responded with status: ${response.status}`);
        }
        
        const satellite = await response.json();
        console.log("recieved data", satellite)
        return satellite;
    } catch (error) {
        console.error("Failed to fetch TLE from local server:", error);
        return null;
    }
}

export async function getTleByNorad(noradId) {
    try {
        const response = await fetch(`/api/tle/${noradId}`);

        if (!response.ok) {
            const body = await response.json().catch(() => ({}));
            throw new Error(body.error || `Server responded with status: ${response.status}`);
        }

        const satellites = await response.json();
        console.log("received data for NORAD", noradId, satellites);
        return satellites;
    } catch (error) {
        console.error(`Failed to fetch TLE for NORAD ${noradId}:`, error);
        return null;
    }
}