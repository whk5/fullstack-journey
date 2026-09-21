import http from 'http';
import fs from 'fs';
import path from 'path';

const MIME: Record<string, string> = {
    '.html': 'text/html; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.js': 'text/javascript; charset=utf-8',
    '.png': 'image/png',
    '.json': 'application/json; charset=utf-8',
};

const ROOT = path.join(import.meta.dirname, 'public');

function createServer() {
    const server = http.createServer((req, res) => {
        let pathname: string;
        let decoded: string;

        try {
            pathname = new URL(req.url ?? '/', 'http://localhost:3031').pathname;
            decoded = decodeURIComponent(pathname);
        } catch {
            res.statusCode = 400;
            res.end('400 Bad Request');
            return;
        }

        const filePath = path.resolve(ROOT, '.' + (decoded === '/' ? '/index.html' : decoded));
        const rel = path.relative(ROOT, filePath);

        if (rel === '..' || rel.startsWith('..' + path.sep) || path.isAbsolute(rel)) {
            res.statusCode = 403;
            res.end('403 Forbidden');
            return;
        }

        res.setHeader('Content-Type', MIME[path.extname(filePath)] || 'text/plain');

        const stream = fs.createReadStream(filePath);

        res.on('close', () => stream.destroy());
        res.on('error', () => stream.destroy());

        stream.on('error', (err: NodeJS.ErrnoException) => {
            if (res.headersSent) {
                res.destroy();
                return;
            }
            if (err.code === 'ENOENT' || err.code === 'ENOTDIR') {
                res.statusCode = 404;
                res.end('404 Not Found');
            } else {
                res.statusCode = 500;
                res.end('500 Internal Server Error');
            }
        });

        stream.pipe(res);
    });

    server.listen(3031, () => {
        console.log('Server is running on port 3031');
    });
}

createServer();
