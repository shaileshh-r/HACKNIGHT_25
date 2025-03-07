const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const app = express();

app.use(express.json());
app.use(express.static('.'));

// Add CORS middleware to allow requests
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, PUT, POST, DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    next();
});

// Ensure users.json exists
async function ensureUsersFile() {
    try {
        await fs.access('users.json');
    } catch {
        console.log('Creating users.json file...');
        await fs.writeFile('users.json', JSON.stringify({ users: [] }, null, 2));
    }
}

// Ensure proposals.json exists
async function ensureProposalsFile() {
    try {
        await fs.access('proposals.json');
    } catch {
        console.log('Creating proposals.json file...');
        await fs.writeFile('proposals.json', JSON.stringify({ proposals: [] }, null, 2));
    }
}

// Initialize the files
ensureUsersFile();
ensureProposalsFile();

// Users endpoints
app.get('/users.json', async (req, res) => {
    try {
        console.log('Reading users.json...');
        const data = await fs.readFile('users.json', 'utf8');
        console.log('File content:', data);
        res.json(JSON.parse(data));
    } catch (error) {
        console.error('Error reading users.json:', error);
        res.json({ users: [] });
    }
});

app.put('/users.json', async (req, res) => {
    try {
        console.log('Received PUT request with data:', req.body);
        await fs.writeFile('users.json', JSON.stringify(req.body, null, 2));
        console.log('Successfully saved users.json');
        res.json({ success: true });
    } catch (error) {
        console.error('Error saving users.json:', error);
        res.status(500).json({ error: 'Failed to save users', details: error.message });
    }
});

// Proposals endpoints
app.get('/proposals.json', async (req, res) => {
    try {
        console.log('Reading proposals.json...');
        const data = await fs.readFile('proposals.json', 'utf8');
        console.log('File content:', data);
        res.json(JSON.parse(data));
    } catch (error) {
        console.error('Error reading proposals.json:', error);
        res.json({ proposals: [] });
    }
});

app.put('/proposals.json', async (req, res) => {
    try {
        console.log('Received PUT request for proposals with data:', req.body);
        await fs.writeFile('proposals.json', JSON.stringify(req.body, null, 2));
        console.log('Successfully saved proposals.json');
        res.json({ success: true });
    } catch (error) {
        console.error('Error saving proposals.json:', error);
        res.status(500).json({ error: 'Failed to save proposals', details: error.message });
    }
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
}); 