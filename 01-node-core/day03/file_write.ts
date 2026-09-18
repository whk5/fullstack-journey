import fs from 'fs';
import path from 'path';


const content = 'Hello, Node.js!';
const filePath = path.join(process.cwd(), '/public/data.json');

function writeFile(content: string) {
    fs.writeFile(filePath, content, { flag: 'a' }, (err) => {
        if (err) {
            console.error(err);
            return;
        }
        console.log('File written successfully');
    });
}

function appendFile(content: string) {
    fs.appendFile(filePath, content, (err) => {
        if (err) {
            console.error(err);
            return;
        }
        console.log('File appended successfully');
    });
}

appendFile(content);

// writeFile(content);
