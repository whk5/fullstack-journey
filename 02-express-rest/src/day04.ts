// 错误捕获
import express, { type Request, type Response, type NextFunction } from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();

app.use(express.static(__dirname));

app.get("/", (req: Request, res: Response, next: NextFunction) => {
    // res.send("Hello, Express!");
    console.log(__dirname);

    fs.readFile(path.join(__dirname, './mkdir/data.json'), (err, data) => {
        if (err) {
            next(err); // Pass errors to Express.
        } else {
            res.json(JSON.parse(data.toString()));
        }
    });
});

app.get('/user/:id', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = await getUserById(req.params.id);
        res.send(user);
    } catch (error: any) {
        next(error);
        // res.status(500).send(error.message);
    }
});

const getUserById = (id: string | string[]) => {
    if (id !== '123') {
        throw new Error('ID is required');
    }
    return {
        id,
        name: 'John Doe',
        email: 'john.doe@example.com',
    };
};


app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});


app.listen(3040, () => {
    console.log('server listening on http://localhost:3040');
});
