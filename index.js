const express = require('express')
const readMocks = require("./loadMocks");

const app = express()
app.use(express.json())

const port = 3000

let responseByEndpoint = [];

const initializeMocks = async () => {
    const mocks = await readMocks();

    mocks.forEach((mock) => {
        responseByEndpoint.push(mock);
    });
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

app.get(/\/api\/v1\/.+/, (req, res) => {
    const path = req.path;
    console.log(`[GET] Get request for path ${path}`);
    const response = responseByEndpoint.find((endpoint) => new RegExp(endpoint.pathRegex).test(path));

    if (!response) {
        console.log(`[GET] Path ${path} not found`);
        res.status(404)
            .send('Not found');
    }

    res.send(response.body);
});

app.listen(port, async () => {
    await initializeMocks();
    console.log(`Mock server listening at http://localhost:${port}`);
});