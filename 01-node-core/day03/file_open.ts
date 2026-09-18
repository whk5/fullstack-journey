import fs from 'fs';
import path from 'path';

const filePath = path.join(process.cwd(), '/public/app.js');

fs.open(filePath, 'r', (err, fd) => {
    if (err) {
        console.error(err);
        return;
    }
    console.log(fd);
});
