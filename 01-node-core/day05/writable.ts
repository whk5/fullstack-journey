import { Writable } from "node:stream";
import { once } from "node:events";


class MyStream extends Writable {
    constructor() {
        super({ highWaterMark: 1 });
    }

    _write(data: Buffer | string, encoding: BufferEncoding, callback: (error?: Error | null) => void): void {
        process.stdout.write(data.toString().toUpperCase() + '\n', callback);
    }
}


async function main() {
    const stream = new MyStream();

    for (let i = 0; i < 10; i++) {
        const waitDrain = !stream.write('hello');
        if (waitDrain) {
            console.log('>> waitDrain');
            await once(stream, 'drain');
        }
    }

    stream.end('world');
}

main().catch(console.error);