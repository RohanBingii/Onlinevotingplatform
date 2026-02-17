const { Candidate, Election } = require("../models/associations");

exports.createCandidate = async (req, res) => {
    try {
        const { name, party, manifesto, photoUrl, electionId } = req.body;

        const election = await Election.findByPk(electionId);
        if (!election) {
            return res.status(404).json({ error: "Election not found" });
        }

        const candidate = await Candidate.create({
            name,
            party,
            manifesto,
            photoUrl,
            electionId
        });

        res.status(201).json({ message: "Candidate created", candidate });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.updateCandidate = async (req, res) => {
    try {
        const { candidateId } = req.params;
        const { name, party, manifesto, photoUrl } = req.body;

        const candidate = await Candidate.findByPk(candidateId);
        if (!candidate) {
            return res.status(404).json({ error: "Candidate not found" });
        }

        candidate.name = name || candidate.name;
        candidate.party = party || candidate.party;
        candidate.manifesto = manifesto || candidate.manifesto;
        candidate.photoUrl = photoUrl || candidate.photoUrl;

        await candidate.save();

        res.json({ message: "Candidate updated", candidate });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.deleteCandidate = async (req, res) => {
    try {
        const { candidateId } = req.params;

        const candidate = await Candidate.findByPk(candidateId);
        if (!candidate) {
            return res.status(404).json({ error: "Candidate not found" });
        }

        await candidate.destroy();

        res.json({ message: "Candidate deleted" });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getCandidatesByElection = async (req, res) => {
    try {
        const { electionId } = req.params;

        const candidates = await Candidate.findAll({
            where: { electionId }
        });

        res.json({ candidates });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getAllCandidates = async (req, res) => {
    try {
        const candidates = await Candidate.findAll();
        res.json({ candidates });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
