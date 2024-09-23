import { v2 as cloudinary } from 'cloudinary';
import sharp from 'sharp';

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

    // Convertion de l'image en WebP pour limiter le poids du fichier
    const webpBuffer = await sharp(buffer).webp({ quality: 80 }).toBuffer();

    // Envoyer l'image convertie à Cloudinary
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
        .end(webpBuffer);
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

export async function deleteSeveralCloudinaryImages(
  publicIds: string[],
): Promise<{ message: string }> {
  try {
    const deletePromises = publicIds.map(async (publicId) => {
      return deleteCloudinaryImage(publicId);
    });

    // Attendre que toutes les images soient supprimées
    await Promise.all(deletePromises);

    return {
      message: 'Toutes les images ont été supprimées de Cloudinary.',
    };
  } catch (error) {
    console.error(
      'Erreur lors de la suppression de plusieurs images Cloudinary.',
      error,
    );
    return {
      message: 'Erreur lors de la suppression des images depuis Cloudinary.',
    };
  }
}
