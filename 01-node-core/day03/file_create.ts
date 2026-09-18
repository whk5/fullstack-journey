import fs from 'fs';
import path from 'path';


const filePath = path.join(process.cwd(), '/mkdir');


function mkdirFile(dirPath: string) {
    fs.mkdir(dirPath, (err) => {
        if (err) {
            console.error(err);
            return;
        }
        console.log('Directory created successfully');
    });
}

function readdirFile(dirPath: string) {
    // fs.readdir(dirPath, (err, files) => {
    //     if (err) {
    //         console.error(err);
    //         return;
    //     }
    //     console.log(files);
    // });

    const files = fs.readdirSync(dirPath);
    const filePaths = files.map((file) => {
        return path.join(dirPath, file);
    })
    console.log(filePaths);
}

function renameFile(oldPath: string, newPath: string) {
    fs.rename(oldPath, newPath, (err) => {
        if (err) {
            console.error(err);
            return;
        }
        console.log('File renamed successfully');
    });
}

function rmdirFile(dirPath: string) {
    fs.rmdir(dirPath, (err) => {
        if (err) {
            console.error(err);
            return;
        }
        console.log('Directory removed successfully');
    });
}


// mkdirFile(filePath);
// readdirFile(path.join(process.cwd(), '/public'));
// renameFile(path.join(process.cwd(), 'file_Create.ts'), path.join(process.cwd(), 'file_create.ts'));
rmdirFile(path.join(process.cwd(), '/mkdir'));