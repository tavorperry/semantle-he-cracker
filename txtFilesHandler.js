import {promises as fsPromises} from "fs";

const asyncReadFile = async (filename, log) => {
    try {
        const contents = await fsPromises.readFile(filename, 'utf-8');
        return contents.split(/\r?\n/);
    } catch (err) {
        log.error(err);
    }
}

const writeToTxtFile = (path, content, log) => {
    fsPromises.writeFile(path, '\n' + content, { flag: 'a+' }, err => {
        if (err) {
            log.error(err);
        }
    });
};

export {
    asyncReadFile,
    writeToTxtFile
}