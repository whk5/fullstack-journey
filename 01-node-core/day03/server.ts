import http from 'http';
import fs from 'fs';
import path from 'path';



function createServer() {
    const server = http.createServer(async (req, res) => {
        const pathname = new URL(req.url!, 'http://localhost:3030').pathname;
        const filePath = path.join(import.meta.dirname, 'public', pathname === '/' ? '/index.html' : pathname.slice(1));

        const ext = path.extname(filePath);
        const MIME: Record<string, string> = {
            '.html': 'text/html; charset=utf-8',
            '.css': 'text/css; charset=utf-8',
            '.js': 'text/javascript; charset=utf-8',
            '.png': 'image/png',
            '.json': 'application/json; charset=utf-8',
        };

        res.setHeader('Content-Type', MIME[ext] || 'text/plain');


        try {
            const data = await fs.promises.readFile(filePath);
            res.end(data);
        } catch (err) {
            if ((err as NodeJS.ErrnoException).code === 'ENOENT') {
                res.statusCode = 404;
                res.end('404 Not Found');
            } else {
                res.statusCode = 500;
                res.end('500 Internal Server Error');
            }
            return;
        }

    });
    server.listen(3030, () => {
        console.log('Server is running on port 3030');
    });
}


createServer();