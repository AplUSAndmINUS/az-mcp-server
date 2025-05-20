const express = require('express');
const bodyParser = require('body-parser');
const { PythonShell } = require('python-shell');
const dotenv = require('dotenv');
const axios = require('axios');
const path = require('path');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());

// GitHub API Base URL
const GITHUB_API_BASE_URL = 'https://api.github.com';

// GitHub API Headers
const githubHeaders = {
  Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
  Accept: 'application/vnd.github.v3+json',
};

// Endpoint to list repositories
app.get('/github/repos', async (req, res) => {
  try {
    const response = await axios.get(`${GITHUB_API_BASE_URL}/user/repos`, {
      headers: githubHeaders,
    });
    res.json(response.data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch repositories from GitHub.' });
  }
});

// Endpoint to create a new repository
app.post('/github/repos', async (req, res) => {
  const { name, description, privateRepo } = req.body;

  if (!name) {
    return res.status(400).json({ error: 'Repository name is required.' });
  }

  try {
    const response = await axios.post(
      `${GITHUB_API_BASE_URL}/user/repos`,
      {
        name,
        description,
        private: privateRepo || false,
      },
      { headers: githubHeaders }
    );
    res.json(response.data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create repository on GitHub.' });
  }
});

// Endpoint to fetch a specific repository
app.get('/github/repos/:owner/:repo', async (req, res) => {
  const { owner, repo } = req.params;

  try {
    const response = await axios.get(`${GITHUB_API_BASE_URL}/repos/${owner}/${repo}`, {
      headers: githubHeaders,
    });
    res.json(response.data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch repository details from GitHub.' });
  }
});

// Endpoint to list available workflows
app.get('/workflows', (req, res) => {
  const workflows = [
    'acceptance-criteria.md',
    'brainstorming.md',
    'bug-report.md',
    'documentation-mgmt.md',
    'planning.md',
    'process-development.md',
    'project-management.md',
  ];
  res.json({ workflows });
});

// Endpoint to run a specific workflow
app.post('/run-workflow', (req, res) => {
  const { workflow } = req.body;

  if (!workflow) {
    return res.status(400).json({ error: 'Please specify a workflow.' });
  }

  // Call the Python script with the selected workflow
  const options = {
    args: [workflow],
  };

  PythonShell.run('workflow_handler.py', options, (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Error running the workflow.' });
    }

    res.json({ message: `Workflow ${workflow} executed successfully.`, results });
  });
});

// Endpoint to list issues for a specific repository
app.get('/github/repos/:owner/:repo/issues', async (req, res) => {
  const { owner, repo } = req.params;

  try {
    const response = await axios.get(`${GITHUB_API_BASE_URL}/repos/${owner}/${repo}/issues`, {
      headers: githubHeaders,
    });
    res.json(response.data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch issues from GitHub.' });
  }
});

// Serve the front-end HTML
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});