import { type Request, type Response } from 'express';
import express from 'express';
import fs from 'fs';
import path from 'path';

const app = express();


async function mkdirFile(dirPath: string, content: string) {
    await fs.mkdir(dirPath, { recursive: true }, (err) => {
        if (err) {
            console.error(err);
            return;
        }
        fs.appendFile(path.join(dirPath, 'data.json'), content, (err) => {
            if (err) {
                console.error(err);
                return;
            }
            console.log('File written successfully');
        });
        console.log('Directory created successfully');
    });
}


app.get('/error', (req: Request, res: Response) => {
    throw new Error('BROKEN'); // Express will catch this on its own.
    res.send('Hello World!');
});

app.get('/read', async (req: Request, res: Response) => {
    await mkdirFile('./mkdir', req.query.content as string);
    fs.readFile(path.join('./mkdir', 'data.json'), (err, data) => {
        if (err) {
            res.send(err.message);
        } else {
            res.send(data.toString());
        }
    });
});


app.listen(3040, () => {
    console.log('server listening on http://localhost:3040');
});