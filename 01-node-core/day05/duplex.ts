import net from "node:net";

const Server = net.createServer((socket: net.Socket) => {
    socket.write('hello');

    socket.on('data', (data: Buffer) => {
        console.log(data.toString());
    });

    socket.on('error', (err: Error) => {
        console.error('socket error:', err.message);
    });

    socket.end('world');
})

Server.listen(8080, () => {
    console.log('Server is running on port 8080');
})