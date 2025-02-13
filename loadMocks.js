const fs = require('fs/promises');
const path = require('path');

const createPath = (folder = '') => {
    if (folder) {
        return path.join(__dirname, 'mocks', folder);
    }

    return path.join(__dirname, 'mocks');
}

const readMocks = async (mocksFolder = '') => {
    const mocksPath = createPath(mocksFolder);

    const files = await fs.readdir(mocksPath);

    return await Promise.all(files
        .filter((file) => file.endsWith('.json'))
        .map(async (file) => {
            const filePath = path.join(mocksPath, file);
            const content = await fs.readFile(filePath, 'utf8');

            return JSON.parse(content);
        }));
}

module.exports = readMocks;