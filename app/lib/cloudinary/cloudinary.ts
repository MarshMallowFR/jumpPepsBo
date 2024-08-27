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
        message: `L'image a bien été supprimée.`,
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

// POUR PLUS TARD => SUPPRESSION GROUPEES D'IMAGES
// const publicIds = ['image_id_1', 'image_id_2', 'image_id_3']; // Les IDs publics des images à supprimer

// cloudinary.api.delete_resources(publicIds, function (error, result) {
//   if (error) {
//     console.error('Erreur lors de la suppression des images :', error);
//   } else {
//     console.log('Images supprimées avec succès :', result);
//   }
// });
