# Mock DAL API
This is a repo to mock DAL responses for testing purposes. If the mock path doesn't exist, it will redirect the call to DAL API in NXT.

## How to use

Install dependencies
```bash
npm install
```

Run the server using the mocks folder you want to use, if you don't send anything it will load all the JSON files in mocks folder ( not recursively ). 

### Example
Here is an example of how to run the server with NCAAB mocks.

```bash
npm start NCAAB
```

## Mock structure

Each api mock you have two JSON values ( **pathRegex** and **body** ).

The **pathRegex** is a regex pattern used to match the request to the mock.

E.g: 
```json
{
  pathRegex: "/api/v1/live/event/\\d+/status",
}
```

The **body** is the response that will be sent to the client.

E.g: 
```json
{
  "body": {
    "status": "scheduled",
    "scheduled": "2025-02-09T23:30:00.000Z",
    "isBoxScoreAvailable": false,
    "isPbpAvailable": false,
    "isQuickBetsAvailable": false,
    "isScoreAvailable": false,
    "comp": "NFL"
  }
}
```