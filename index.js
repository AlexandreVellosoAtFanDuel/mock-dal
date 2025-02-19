const express = require('express')
const axios = require('axios');

require('dotenv').config();

const readMocks = require("./loadMocks");

const app = express()
app.use(express.json())

const port = 3000

let responseByEndpoint = [];

const initializeMocks = async (mocksFolder = '') => {
    const mocks = await readMocks(mocksFolder);

    mocks.forEach((mock) => {
        responseByEndpoint.push(mock);
    });

    if (mocks.length === 0) {
        console.log(`[INIT] No mocks found`);
    } else if (mocks.length === 1) {
        console.log(`[INIT] Found ${mocks.length} mock`);
    } else {
        console.log(`[INIT] Found ${mocks.length} mocks`);
    }
}

const redirectToDal = async (path) => {
    const protocol = process.env.DAL_URL.startsWith('localhost:') ? 'http' : 'https';
    try {
        const resp = await axios.get(`${protocol}://${process.env.DAL_URL}${path}`, {
            method: 'GET',
            timeout: 10000,
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
                'Accept-Encoding': 'gzip, deflate, br',
            },
        });

        return {
            body: resp.data,
            status: resp.status
        }
    } catch (err) {
        console.error(`[DAL] Error: ${path}`);
        return {
            body: err.response.data,
            status: err.response.status
        }
    }
}

const shouldRedirectToDal = () => process.env.SHOULD_REDIRECT_TO_DAL === 'true';

app.get(/\/api\/v1\/.+/, async (req, res) => {
    const path = req.path;
    console.log(`[GET] Get request for path ${path}`);
    const response = responseByEndpoint.find((endpoint) => new RegExp(endpoint.pathRegex).test(path));

    if (!response) {
        console.log(`[GET] Path ${path} not found`);

        if (shouldRedirectToDal()) {
            console.log(`[GET] Redirecting to DAL for path ${path}`);

            const response = await redirectToDal(path);
            res.status(response.status)
                .send(response.body);
            return;
        }

        res.status(404)
            .send('Not found');
        return;
    }

    res.send(response.body);
});

app.listen(port, async () => {
    const mocksFolder = process.argv[2] ?? '';

    if (mocksFolder) {
        console.log(`[INIT] Initializing mocks from folder: ${mocksFolder}`);
    }

    await initializeMocks(mocksFolder);

    console.log(`[INIT] Redirecting requests to DAL: ${shouldRedirectToDal()}`);

    console.log(`Mock server listening at http://localhost:${port}`);
});