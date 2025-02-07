const fs = require('fs/promises');
const path = require('path');

const readMocks = async () => {
    const mocksPath = path.join(__dirname, 'mocks');

    const files = await fs.readdir(mocksPath);

    return await Promise.all(files.map(async (file) => {
        const filePath = path.join(__dirname, 'mocks', file);
        const content = await fs.readFile(filePath, 'utf8');

        return JSON.parse(content);
    }));
}

module.exports = readMocks;