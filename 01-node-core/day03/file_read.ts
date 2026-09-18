import fs from 'fs';
import path from 'path';
import { pipeline } from 'stream';

// 异步读取文件
// fs.readFile('./public/index.html', 'utf-8', (err, data) => {
//     if (err) {
//         console.error(err);
//         return;
//     }
//     console.log(data);
// });

// 同步读取文件
// try {
//     const data = fs.readFileSync('./public/index.html', 'utf-8');
//     console.log(data);
// } catch (err) {
//     console.error(err);
// }

// 异步读取文件
// fs.promises.readFile('./public/index.html', 'utf-8').then(data => {
//     console.log(data);
// });

// 通过流来读取文件

const fileUrl = './public/index.html';
const outputFilePath = path.join(process.cwd(), '/public/index.html');


async function downLoadFile(url: string, outputFilePath: string) {
    const response = await fetch(outputFilePath);
    console.log(response);

    // if (response.ok) {
    //     const fileStream = fs.createWriteStream(outputFilePath);
    //     console.log(`Downloading file from ${url} to ${outputFilePath}`);
    // } else {
    //     console.error('文件下载失败');
    // }
}

async function readFile(filePath: string) {
    const readStream = fs.createReadStream(filePath, 'utf-8');

    try {
        for await (const chunk of readStream) {
            console.log('--- File chunk start ---');
            console.log(chunk);
            console.log('--- File chunk end ---');
        }
        console.log('Finished reading the file.');

    } catch (error) {

    }


}

// readFile(outputFilePath);

downLoadFile(fileUrl, outputFilePath);