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

app.post('/api/v1/addEvent', (req, res) => {
    const {pathRegex, body} = req.body;

    console.log(`[ADD] Adding event for path ${pathRegex}`);

    responseByEndpoint.push({
        pathRegex,
        body
    });

    res.send({
        status: 'OK'
    });
});

app.post('/api/v1/updateEvent', (req, res) => {
    const {pathRegex, body} = req.body;

    console.log(`[UPDATE] Updating event for path ${pathRegex}`);

    const endpoint = responseByEndpoint.find((endpoint) => endpoint.pathRegex === pathRegex);

    if (!endpoint) {
        console.log(`[UPDATE] Path ${pathRegex} not found`);

        return res.status(404)
            .send('Not found');
    }

    endpoint.body = body;

    res.send({
        status: 'OK'
    });
});

app.delete('/api/v1/deleteEvent', (req, res) => {
    const {pathRegex} = req.body;

    console.log(`[DELETE] Deleting event for path ${pathRegex}`);

    const endpoint = responseByEndpoint.find((endpoint) => endpoint.pathRegex === pathRegex);

    if (!endpoint) {
        console.log(`[DELETE] Path ${pathRegex} not found`);
        return res.status(404)
            .send('Not found');
    }

    responseByEndpoint = responseByEndpoint.filter((endpoint) => endpoint.pathRegex !== pathRegex);

    res.send({
        status: 'OK'
    });
});

app.get(/\/api\/v1\/.+/, async (req, res) => {
    const path = req.path;
    console.log(`[GET] Get request for path ${path}`);
    const response = responseByEndpoint.find((endpoint) => new RegExp(endpoint.pathRegex).test(path));

    if (!response) {
        console.log(`[GET] Path ${path} not found`);

        if (process.env.SHOULD_REDIRECT_TO_DAL === 'true') {
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

    console.log(`[INIT] Redirecting requests to DAL: ${process.env.SHOULD_REDIRECT_TO_DAL === 'true'}`);

    console.log(`Mock server listening at http://localhost:${port}`);
});