import { createReadStream, createWriteStream } from "node:fs";
import { stat } from "node:fs/promises";
import { createGzip } from "node:zlib";
import { pipeline } from "node:stream/promises";
import path from "node:path";

const input = path.join(import.meta.dirname, "public", "big.bin");
const output = path.join(import.meta.dirname, "big.bin.gz");

try {
    await pipeline(createReadStream(input), createGzip(), createWriteStream(output));
    const [inSize, outSize] = await Promise.all([stat(input), stat(output)]);
    console.log(`${input} ${inSize.size} bytes -> ${output} ${outSize.size} bytes`);
} catch (err) {
    console.error("gzip failed:", err);
    process.exitCode = 1;
}
