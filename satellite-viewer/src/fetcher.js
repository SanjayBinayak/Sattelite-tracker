// Cleaned up: No Node 'child_process' imports are here anymore!
export async function getTlesFromPython() {
    try {
        // Fetch the data from your new Node Express server background utility
        const response = await fetch('http://localhost:3000/api/tle');
        
        if (!response.ok) {
            throw new Error(`Server responded with status: ${response.status}`);
        }
        
        const data = await response.json();
        return data; // Returns { name, line1, line2 }
    } catch (error) {
        console.error("Failed to fetch TLE from local server:", error);
        return null;
    }
}
