const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });

const BASE_URL = `http://localhost:${process.env.PORT || 8000}/api`;

// Helper function for formatted console output
async function makeRequest(name, method, endpoint, body = null, token = null) {
    console.log(`\n--- 🚀 Testing: ${name} ---`);
    
    const headers = { "Content-Type": "application/json" };
    if (token) headers["Authorization"] = `Bearer ${token}`;

    try {
        const response = await fetch(`${BASE_URL}${endpoint}`, {
            method,
            headers,
            body: body ? JSON.stringify(body) : null
        });

        const data = await response.json();
        const status = response.status;

        if (status >= 200 && status < 300) {
            console.log(`✅ Status: ${status}`);
        } else if (status >= 400 && status < 500) {
            console.log(`⚠️ Status: ${status} (Expected Edge Case)`);
        } else {
            console.log(`❌ Status: ${status}`);
        }
        
        console.log(`Response:`, JSON.stringify(data, null, 2));
        return { status, data };
    } catch (err) {
        console.error("❌ Request Failed:", err.message);
        return { status: 500, data: null };
    }
}

async function runSimulation() {
    console.log("=========================================");
    console.log("   SECURE VOTING API - MULTIPLE VOTES    ");
    console.log("=========================================\n");

    // 1. Setup Phase: Admin Login
    const adminLogin = await makeRequest("Admin Login", "POST", "/auth/login", {
        email: "admin@securevote.com", password: "admin123"
    });
    const adminToken = adminLogin.data.token;

    // 2. Setup Phase: Admin creates a NEW Active Election
    const activeElectionRes = await makeRequest("Create Active Election", "POST", "/election/create", {
        title: "Simulation Active Election",
        description: "An election created dynamically for testing.",
        startTime: new Date(Date.now() - 100000), 
        endTime: new Date(Date.now() + 86400000)  
    }, adminToken);
    const activeElectionId = activeElectionRes.data.election.id;

    // 3. Setup Phase: Admin creates Candidates for Active Election
    const cand1Res = await makeRequest("Create Candidate 1 (Dave)", "POST", "/candidates", {
        name: "Developer Dave", party: "Backend Party", electionId: activeElectionId
    }, adminToken);
    const cand1Id = cand1Res.data.candidate.id;

    const cand2Res = await makeRequest("Create Candidate 2 (Fiona)", "POST", "/candidates", {
        name: "Frontend Fiona", party: "React Coalition", electionId: activeElectionId
    }, adminToken);
    const cand2Id = cand2Res.data.candidate.id;

    // 4. Setup Phase: Register & Login 5 Voters
    const voters = [
        { email: "user1@test.com", password: "password123", token: "" },
        { email: "user2@test.com", password: "password123", token: "" },
        { email: "user3@test.com", password: "password123", token: "" },
        { email: "user4@test.com", password: "password123", token: "" },
        { email: "user5@test.com", password: "password123", token: "" }
    ];

    console.log("\n--- Registering 5 Voters ---");
    for (let i = 0; i < voters.length; i++) {
        await makeRequest(`Register Voter ${i+1}`, "POST", "/auth/register", {
            email: voters[i].email, password: voters[i].password
        });
        const loginRes = await makeRequest(`Login Voter ${i+1}`, "POST", "/auth/login", {
            email: voters[i].email, password: voters[i].password
        });
        voters[i].token = loginRes.data.token;
    }

    console.log("\n=========================================");
    console.log("         BEGIN VOTING & EDGE CASES       ");
    console.log("=========================================\n");

    // SUCCESS CASES: Stacking 3 votes for Developer Dave
    await makeRequest("[SUCCESS] Voter 1 votes for Dave", "POST", "/vote/cast", {
        electionId: activeElectionId, voteChoice: cand1Id
    }, voters[0].token);

    await makeRequest("[SUCCESS] Voter 2 votes for Dave", "POST", "/vote/cast", {
        electionId: activeElectionId, voteChoice: cand1Id
    }, voters[1].token);

    await makeRequest("[SUCCESS] Voter 3 votes for Dave", "POST", "/vote/cast", {
        electionId: activeElectionId, voteChoice: cand1Id
    }, voters[2].token);

    // SUCCESS CASE: 1 vote for Frontend Fiona
    await makeRequest("[SUCCESS] Voter 4 votes for Fiona", "POST", "/vote/cast", {
        electionId: activeElectionId, voteChoice: cand2Id
    }, voters[3].token);


    // EDGE CASES
    await makeRequest("[EDGE CASE] Voter 1 tries to double vote for Dave", "POST", "/vote/cast", {
        electionId: activeElectionId, voteChoice: cand1Id
    }, voters[0].token);

    await makeRequest("[EDGE CASE] Voter 5 votes for non-existent candidate ID 99", "POST", "/vote/cast", {
        electionId: activeElectionId, voteChoice: 99
    }, voters[4].token);


    // 5. Admin Action: Close the Election
    await makeRequest("Admin Closes Active Election", "POST", `/election/close/${activeElectionId}`, null, adminToken);

    // 6. Results & Verification
    console.log("\n=========================================");
    console.log("       RESULTS & AUDIT VERIFICATION      ");
    console.log("=========================================\n");

    // This should now show Developer Dave with 3 votes, and Frontend Fiona with 1 vote!
    await makeRequest("Admin Views Tally", "GET", `/election/results/${activeElectionId}`, null, adminToken);

    await makeRequest("Verify Blockchain Audit Log", "GET", "/audit/verify", null, adminToken);

    console.log("\n🏁 SIMULATION COMPLETE.");
}

runSimulation();