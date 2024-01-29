import {v2 as cloudinary} from 'cloudinary'
import fs from 'fs'

cloudinary.config({
  cloud_name: process.env.CLOUDNARY_CLOUD_NAME,
  api_key: process.env.CLOUDNARY_API_KEY,
  api_secret: process.env.CLOUDNARY_API_SECRET,
  secure: true,
});


const addFilesToCloudnary = async(localFilePath)=>{
    try {
        if(!localFilePath) return null

        const targetFolder = "samples/trialApi";

        const response = await cloudinary.uploader.upload(localFilePath,{
            resource_type: "auto",
            folder: targetFolder
        })
        console.log(response);

        fs.unlinkSync(localFilePath)
        return response
    } catch (error) {
        fs.unlinkSync(localFilePath)
        return null
    }
}

const getPublicIdFromUrl = (url) => {
    const publicIdMatches = url.match(/\/v\d+\/samples\/trialApi\/(.+?)\.\w+/);
    return publicIdMatches ? publicIdMatches[1] : null;
}; 

const deleteFilesFromCloudnary = async(oldFilePath, type) => {
    if(oldFilePath){
        try {
            const publicId = getPublicIdFromUrl(oldFilePath);
            console.log("Public ID to delete:", `samples/trialApi/${publicId}`);
            let result
            if(type.toString() === 'video'.toString()){
                result = await cloudinary.uploader.destroy(`samples/trialApi/${publicId}`,
                    {
                        resource_type: 'video',
                        invalidate: true
                    }
                )
            }
            else{
                result = await cloudinary.uploader.destroy(`samples/trialApi/${publicId}`,
                    {
                        resource_type: 'image',
                        invalidate: true
                    }
                )
            }

            if(result.result === 'ok'){
                console.log(`File deleted from Cloudinary: ${publicId}`);
            }
            else{
                console.error(`Failed to delete file from Cloudinary: ${result.result}`);
            }
        } catch (error) {
            console.error(`Error deleting file from Cloudinary`, error);
        }
    }
    
}

export {addFilesToCloudnary, deleteFilesFromCloudnary}

