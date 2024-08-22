import { v2 as cloudinary } from 'cloudinary';

// Configuration de Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function getCloudinaryPicture(picture: File): Promise<string> {
  let imageUrl = '';
  if (picture) {
    const arrayBuffer = await picture.arrayBuffer();
    const buffer = new Uint8Array(arrayBuffer);
    const result = await new Promise<any>((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          { tags: ['nextjs-server-actions-upload-sneakers'] },
          (error, result) => {
            if (error) {
              reject(error);
              return;
            }
            resolve(result);
          },
        )
        .end(buffer);
    });
    imageUrl = result.secure_url;
  }
  return imageUrl;
}

export async function deleteCloudinaryImage(
  publicId: string,
): Promise<{ message: string }> {
  try {
    const result = await cloudinary.uploader.destroy(publicId);

    if (result.result === 'ok') {
      return {
        message: `l'image '${publicId}' a bien été supprimée de Cloudinary.`,
      };
    }

    return {
      message: `Erreur dans la suppression de l'image '${publicId}' depuis Cloudinary.`,
    };
  } catch (error) {
    console.error('Cloudinary Error: Failed to delete image.', error);
    return {
      message: "Erreur lors de la suppression de l'image dans Cloudinary.",
    };
  }
}
