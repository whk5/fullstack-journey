import { createServer } from 'node:http';

createServer((request, response) => {
    const { headers, method, url } = request;
    const chunks: Buffer[] = [];
    request
        .on('error', err => {
            console.error(err);
        })
        .on('data', chunk => {
            console.log(chunk);
            console.log(chunk.toString());
            chunks.push(chunk);
        })
        .on('end', () => {
            const body = Buffer.concat(chunks).toString();
            // BEGINNING OF NEW STUFF
            response.on('error', err => {
                console.error(err);
            });
            response.writeHead(200,{
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
            })
            //注：以上两行可以替换为下一行：
            //response.writeHead(200, {'Content-Type': 'application/json'});
            const responseBody = { headers, method, url, body };
            response.write(JSON.stringify(responseBody));
            response.end();
            // 以上两行可以替换为下一行：
            //response.end(JSON.stringify(responseBody));
            // END OF NEW STUFF
        });
})
    .listen(8080);