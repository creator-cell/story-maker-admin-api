import { unlinkSync, writeFileSync } from "fs";
import {dirname, join} from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const uploadFile = (fileName, file, folderName) => {
    const fileBasePath = join(__dirname,'..','uploads',folderName,fileName);   

    try {
        writeFileSync(fileBasePath, file);

        return {
            success:true,
            url: `http://localhost:${process.env.PORT}/uploads/${folderName}/${fileName}`
        }
    } catch (error) {
        console.log(error);
        return {
            success: false
        }
    }
}

const deleteFile = (fileName, folderName) => {
    const fileBasePath = join(__dirname,'..','uploads',folderName,fileName);   

    try {
            
        unlinkSync(fileBasePath);

        return {
            success:true
        }

    } catch (error) {
        console.log(error);
        return {
            success:false
        }
    }
}

export {
    uploadFile,
    deleteFile
}