import express from 'express';
import cors from 'cors';
import * as crypto from 'crypto';
import axios from 'axios';
import { unescape } from 'querystring';

const app = express();
app.use(cors());
app.use(express.json({ limit: '100kb' }));

const port = process.env.PORT || 3000;

app.listen(port, () => {
    console.log(`Server started on port ${port}`);
});

// Encode the input to UTF-8.
function St(t: string): string {
    return unescape(encodeURIComponent(t));
}

// Generate HMAC-SHA256 signature.
function sign(secretKey: string, message: string): string {
    const key = St(secretKey);
    const msg = St(message);
    console.log('Key:', key);
    console.log('Message:', msg);
    return crypto.createHmac('sha256', key).update(msg).digest('hex');
}

const secretKey = "xPspN9chMbZ4mcvN";

// Serve HTML for the root route.
app.get('/', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>4B1W Solver</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    background-color: #f4f4f4;
                    margin: 0;
                    padding: 20px;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    height: 100vh;
                }
                .container {
                    background: #fff;
                    padding: 20px;
                    border-radius: 8px;
                    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
                    max-width: 400px;
                    width: 100%;
                    text-align: center;
                }
                input, button {
                    width: calc(100% - 20px);
                    padding: 10px;
                    margin-top: 10px;
                    border-radius: 5px;
                    border: 1px solid #ddd;
                }
                button {
                    background-color: #007BFF;
                    color: white;
                    border: none;
                    cursor: pointer;
                }
                button:hover {
                    background-color: #0056b3;
                }
                .result {
                    margin-top: 20px;
                    background: #e9ecef;
                    padding: 10px;
                    border-radius: 5px;
                    display: none;
                }
                .footer {
                    margin-top: 20px;
                    font-size: 0.9em;
                    color: #555;
                }
                .footer a {
                    color: #007BFF;
                    text-decoration: none;
                }
                .footer a:hover {
                    text-decoration: underline;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <h1>Solve 4B1W Puzzle</h1>
                <input type="text" id="linkInput" placeholder="Paste your 'Ask a friend' link here" />
                <button onclick="sendLink()">Solve</button>
                <div id="result" class="result"></div>
                <div class="footer">
                    <p>Check out the project on <a href="https://github.com/jannikhst/4bilder1wort-solver" target="_blank">GitHub</a>.</p>
                </div>
            </div>

            <script>
                async function sendLink() {
                    const link = document.getElementById('linkInput').value;
                    if (!link) {
                        alert('Please enter a link.');
                        return;
                    }

                    try {
                        // Send a POST request with the provided link.
                        const response = await fetch('/solve', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({ link })
                        });
                        const data = await response.json();

                        // Display the solution or error message.
                        document.getElementById('result').style.display = 'block';
                        document.getElementById('result').innerText = data.message || data.error;
                    } catch (error) {
                        console.error('Error:', error);
                        alert('An error occurred while solving the puzzle.');
                    }
                }
            </script>
        </body>
        </html>
    `);
});

// Handle the /solve POST request.
app.post('/solve', async (req, res) => {
    const { link } = req.body;

    // Validate if the link is provided.
    if (!link) {
        return res.status(400).json({ error: 'Link is required' });
    }

    try {
        // Parse the provided URL.
        const url = new URL(link);
        const path = url.pathname;
        console.log('Path:', path);

        // Extract puzzle ID and user ID from the path.
        const splitted = path.replace('/help', '').split('/');
        const puzzleId = splitted[1].substring(2);
        const userId = splitted[2];

        console.log('Puzzle ID:', puzzleId);
        console.log('User ID:', userId);

        // Extract the language from the 'Accept-Language' header, default to 'en'.
        const language = req.headers['accept-language']?.split(',')[0].split('-')[0] || 'en';

        console.log('Language:', language);

        // Construct the formatted path required by the API.
        const formattedPath = `help/requests/${language}-${puzzleId}-${userId}`;
        console.log('Formatted Path:', formattedPath);

        // Generate the signature for the request.
        const signature = sign(secretKey, formattedPath);
        console.log('Signature:', signature);

        // Construct the complete request URL.
        const requestUrl = `https://4bilder1wort.app/${formattedPath}`;
        console.log('Request URL:', requestUrl);

        // Make a GET request to the external API with the Authorization header.
        const response = await axios.get(requestUrl, {
            headers: {
                Authorization: signature,
            },
        });

        console.log('Response:', response.data);

        // Extract the solution from the API response.
        const data = response.data;
        const puzzle = data.data.puzzle;
        const solution = puzzle.solution;
        console.log('Solution:', solution);

        // Send the solution back to the client.
        res.json({ message: solution });
    } catch (error) {
        console.error('Error during request:', error);
        res.status(500).json({ error: 'Failed to process the request' });
    }
});