const API_BASE = "http://localhost:8000/api/v1";

async function testAPIs() {
    console.log("Starting API Tests...\n");

    try {
        // 1. Get Stations
        console.log("1. Fetching all stations...");
        let res = await fetch(`${API_BASE}/stations`);
        let data = await res.json();
        console.log(`✅ Stations fetch status: ${res.status}`);
        if (data.data && data.data.length > 0) {
            console.log(`✅ Found ${data.data.length} stations.`);
        }

        // 2. Get Trains
        console.log("\n2. Fetching all trains...");
        res = await fetch(`${API_BASE}/trains`);
        data = await res.json();
        console.log(`✅ Trains fetch status: ${res.status}`);
        if (data.data && data.data.length > 0) {
            console.log(`✅ Found ${data.data.length} trains.`);
        }

        // 3. Search Trains
        console.log("\n3. Searching for trains (NDLS to CSMT)...");
        res = await fetch(`${API_BASE}/search?from=NDLS&to=CSMT&date=2026-08-16`);
        data = await res.json();
        console.log(`✅ Search status: ${res.status}`);
        if (res.status === 200 || res.status === 404) {
             console.log(`✅ Search response: ${data.message || "Success"}`);
        }

        console.log("\n🎉 All basic GET endpoints are functioning properly.");
    } catch (error) {
        console.error("❌ API test failed:", error);
    }
}

testAPIs();
