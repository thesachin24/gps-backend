import { v2 } from 'cloudinary'
const cloudinary = v2
import Jimp from 'jimp';
import { CustomError } from '../utils';
import {
  IMAGE_MAX_SIZE,
  MESSAGE_CONSTANTS,
  UN_PROCESSABLE_ENTITY
} from '../constants';

//Cloudinary configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

/**
 * Middleware function to upload file to the AWS Bucket.
 * @returns {object} success and error messages
 */
const uploadFile = async (options, uploadObj) => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream(options, (err, res) => {
      if (err) {
        reject(err);
      } else {
        resolve(res);
      }
    }).end(uploadObj);
  });
};

/**
 * function to resize image before upload on AWS S3.
 * @returns {object} success and error messages
 */
const resizeImage = async (image, contentType) => {
  return new Promise((resolve, reject) => {
    image.quality(80).getBase64(contentType, function (err, src) {
      if (err) {
        reject(err);
      }
      resolve(src);
    });
  });
};
/**
 * function to compress image before upload on AWS S3.
 * @returns {object} success and error messages
 */
const compressImage = async (buffer, contentType) => {
  return new Promise((resolve, reject) => {
    Jimp.read(buffer, (err, image) => {
      if (err) {
        reject(err);
      } else {
        resolve(resizeImage(image, contentType));
      }
    });
  });
};

const calculateImageSize = base64String => {
  let padding, inBytes;
  if (base64String.endsWith('==')) {
    padding = 2;
  } else if (base64String.endsWith('=')) {
    padding = 1;
  } else {
    padding = 0;
  }
  const base64StringLength = base64String.length;
  inBytes = (base64StringLength / 4) * 3 - padding;
  return inBytes;
};
/**
 * function to upload Base64 file on AWS Bucket.
 * @returns {object} success and error messages
 */
export const uploadBase64Image = async (fileInfo, fileName, filePath) => {
  if (!fileInfo) {
    return {
      location: null,
      Location: null
    };
  }
  const base64String = fileInfo.replace(/^data:image\/\w+;base64,/, '');
  const imageSize = await Promise.resolve(calculateImageSize(base64String));
  if (imageSize > IMAGE_MAX_SIZE) {
    throw new CustomError(
      UN_PROCESSABLE_ENTITY,
      MESSAGE_CONSTANTS.INVALID_FILE_SIZE
    );
  }
  let buf = Buffer.from(base64String, 'base64');
  let extension, jimpExt;
  const split = fileName.split('.');
  extension = `.${split[split.length - 1]}`;
  switch (extension) {
    case '.png':
      jimpExt = Jimp.MIME_PNG;
      break;
    case '.jpg':
      jimpExt = Jimp.MIME_JPEG;
      break;
    case '.jpeg':
      jimpExt = Jimp.MIME_JPEG;
      break;
    default:
      break;
  }
  if (jimpExt) {
    try {
      const image = await compressImage(buf, jimpExt);
      buf = Buffer.from(
        image.replace(/^data:image\/\w+;base64,/, ''),
        'base64'
      );
    } catch (err) {
      throw new CustomError(
        UN_PROCESSABLE_ENTITY,
        MESSAGE_CONSTANTS.UNABLE_TO_COMPRESS
      );
    }
  }

  const newPath = `gps-app/${filePath}`;
  const options = {
    folder: newPath,
    public_id: `${Date.now()}`,
    use_filename: true,
    unique_filename: false,
    resource_type: "image",
    access_mode: "public",
    overwrite: true
  }
  try {
    return await uploadFile(options, buf);
  } catch (err) {
    throw new CustomError(UN_PROCESSABLE_ENTITY, err.message);
  }
};


/**
 * function to upload Base64 file on AWS Bucket.
 * @returns {object} success and error messages
 */
 export const uploadBufferFile = async (path, name, buf) => {

  // const newPath = `${path}/${name}`;
  const options = {
    folder: path,
    public_id: name,
    use_filename: true,
    unique_filename: false,
    resource_type: "auto",
    access_mode: "public",
    overwrite: true
  }
  try {
    return await uploadFile(options, buf);
  } catch (err) {
    throw new CustomError(UN_PROCESSABLE_ENTITY, err.message);
  }
};


/**
 * delete image from aws s3 bucket
 * @property {string} location - url of the file to be deleted
 * @returns  success message on success and error object on failure
 */
export const handleDeleteMedia = async location => {
  if(!location){
    return;
  }
  const match = location.match(/\/v\d+\/(.+?)\./);
  const publicId = match ? match[1] : null;
  try{
    if(publicId){
      await cloudinary.uploader.destroy(publicId);
    }
  }catch(err){
    console.error('Error deleting image:', err);
  }
};
/**
 * Upload base 64 image to aws s3 bucket and delete the previous image
 * @property {string} image - base64 string of image
 * @property {string} name - name of the file
 * @property {string} oldPath - url of the file to be deleted
 * @property {string} path - key of the image upload
 * @returns  object containing uploaded image data and error object on failure
 */
export const handleUploadAndDeleteImage = async (
  image,
  name,
  oldPath,
  path
) => {
  if (oldPath) {
    handleDeleteMedia(oldPath);
  }
  return uploadBase64Image(image, name, path);
};


export const handleUploadAndDeleteVideo = async (
  video,
  name,
  oldPath,
  path
) => {
  if (oldPath) {
    handleDeleteMedia(oldPath);
  }
  return uploadVideoAndDeleteVideo(video, name, path);
};


/**
 * Upload video file to Cloudinary
 * @param {Buffer} videoBuffer - The video file buffer
 * @param {string} fileName - Name of the video file
 * @param {string} filePath - Path where video should be stored
 * @returns {Promise<Object>} Cloudinary upload response
 */
export const uploadVideoAndDeleteVideo = async (videoBuffer, fileName, filePath) => {
  if (!videoBuffer) {
    return {
      location: null,
      Location: null
    };
  }

  const newPath = `gps-app/${filePath}`;
  const options = {
    folder: newPath,
    public_id: `${Date.now()}`,
    use_filename: true,
    unique_filename: false,
    resource_type: "video",
    access_mode: "public",
    overwrite: true
  };

  try {
    return await uploadFile(options, videoBuffer);
  } catch (err) {
    throw new CustomError(UN_PROCESSABLE_ENTITY, err.message);
  }
};
