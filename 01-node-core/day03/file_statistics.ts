import fs from 'fs';

// 异步获取文件统计信息
// fs.stat('./public/index.html', (err, stats) => {
//     if (err) {
//         console.error(err);
//         return;
//     }
//     console.log(stats);
// });


// 同步获取文件统计信息
try {
    const stats = fs.statSync('./public/index.html');
    console.log(stats);
    console.log(stats.isFile());
} catch (err) {
    console.error(err);
}