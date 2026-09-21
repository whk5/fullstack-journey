import { Readable } from "node:stream";

class MyStream extends Readable {
    #count = 0;
    _read(size: number): void {
        this.push(':)');
        if (++this.#count === 5) {
            this.push(null);
        }
    }
}

const stream = new MyStream({
    highWaterMark: 1,
});
// stream.on('data', (chunk) => {
//     console.log(chunk.toString());
// });

stream.on('readable', () => {
    console.count('>> readable event');
    let chunk
    while ((chunk = stream.read()) !== null) {
        console.log(chunk.toString());
    }
});

stream.on('end', () => {
    console.count('>> Stream ended');
});