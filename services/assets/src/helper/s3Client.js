import 'dotenv/config';
import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';

const config = {
    region: process.env.REGION,
    credentials: {
        accessKeyId: process.env.ACCESS_KEY,
        secretAccessKey: process.env.SECRET_KEY
    },
}

const S3 = new S3Client(config);

const UploadFile = async (fileName, file, folderName) => {
    try {
        if (!file || !fileName) {
            return { Error:"file and fileName not found", Success: false };
        }
        const Params = {
            Bucket: process.env.BUCKET_NAME,
            Key: `${folderName}/${fileName}`,
            Body: file,
            ContentType: 'image/jpg,jpeg,png,ico'
        }
        const Command = new PutObjectCommand(Params);
        const Response = await S3.send(Command);
        if (Response.$metadata.httpStatusCode !== 200) {
            return { Error:Response.$metadata, Success: false };
        }
        const ImageURl = `https://${process.env.BUCKET_NAME}.s3.${process.env.REGION}.amazonaws.com/${Params.Key}`;
        return { success: true, url: ImageURl };
    } catch (Error) {
        console.log(Error);
        return Error;
    }
}

const GetFile = async (FileName) => {
    try {
        if (!FileName) {
            return { Error:"fileName not found", Success:false };
        }
        const Params = {
            Bucket: process.env.BUCKET_NAME,
            Key: FileName
        }
        const Command = new GetObjectCommand(Params);
        const Response = await S3.send(Command);
        // console.log(response);
        if (Response.$metadata.httpStatusCode !== 200) {
            return { success: false, error: Response.$metadata }
        }
        return { success:true, message: "File Get successfully", data: Response.$metadata}
    } catch (Error) {
        return Error;
    }
}

const getUrlToFile = async (url) => {
  const res = await fetch(url);
  const buffer = await res.arrayBuffer();
  return buffer;
};


const DeleteFile = async (FileName) => {
    try {
        if (!FileName) {
            return { error:"fileName not found", success:false };
        }
        const Params = {
            Bucket: process.env.BUCKET_NAME,
            Key: FileName
        }
        const Command = new DeleteObjectCommand(Params);
        const Response = await S3.send(Command);
        // console.log(Response);
        if (Response.$metadata.httpStatusCode !== 204) {
            return { success: false, error: Response.$metadata }
        }
        return { success:true, message: "File Removed successfully"}
    } catch (Error) {
        return Error;
    }
}

export {
    UploadFile,
    DeleteFile,
    GetFile,
    getUrlToFile
}