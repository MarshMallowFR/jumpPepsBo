import { v2 as cloudinary } from 'cloudinary';
//import sharp from 'sharp';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// export async function getCloudinaryPicture(picture: File): Promise<string> {
//   let imageUrl = '';
//   if (picture) {
//     const arrayBuffer = await picture.arrayBuffer();
//     const buffer = new Uint8Array(arrayBuffer);

//     // Convertion de l'image en WebP pour limiter le poids du fichier
//     const webpBuffer = await sharp(buffer).webp({ quality: 80 }).toBuffer();

//     // Envoyer l'image convertie à Cloudinary
//     const result = await new Promise<any>((resolve, reject) => {
//       cloudinary.uploader
//         .upload_stream(
//           { tags: ['nextjs-server-actions-upload-sneakers'] },
//           (error, result) => {
//             if (error) {
//               reject(error);
//               return;
//             }
//             resolve(result);
//           },
//         )
//         .end(webpBuffer);
//     });

//     imageUrl = result.secure_url;
//   }
//   return imageUrl;
// }

export async function getCloudinaryPicture(picture: File) {
  let imageUrl = '';
  if (picture) {
    const arrayBuffer = await picture.arrayBuffer();
    const buffer = new Uint8Array(arrayBuffer);

    // Crée un Blob depuis le buffer
    const blob = new Blob([buffer]);

    // Utilisation de createImageBitmap pour convertir l'image en WebP via un canvas
    const imageBitmap = await createImageBitmap(blob);
    const canvas = document.createElement('canvas');
    canvas.width = imageBitmap.width;
    canvas.height = imageBitmap.height;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(imageBitmap, 0, 0);
    }

    // Conversion du canvas en WebP
    const webpBlob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob((blob) => resolve(blob), 'image/webp', 0.8);
    });

    if (!webpBlob) {
      throw new Error('Failed to convert image to WebP format');
    }

    // Conversion du Blob en Buffer pour Cloudinary
    const webpArrayBuffer = await webpBlob.arrayBuffer();
    const webpBuffer = Buffer.from(webpArrayBuffer);

    // Envoi de l'image à Cloudinary
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

export async function deleteCloudinaryImage(publicId: string) {
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

export async function deleteCloudinaryImages(imageUrls: string[]) {
  const publicIds: string[] = imageUrls
    .map((url) => {
      const parts = url.split('/');
      return parts.length > 0 ? parts.pop()?.split('.')[0] : undefined;
    })
    .filter((id): id is string => id !== undefined); // Filtrer les undefined

  if (publicIds.length === 0) {
    return { message: 'Aucune image à supprimer.' };
  }

  try {
    const result = await cloudinary.api.delete_resources(publicIds, {
      resource_type: 'image',
    });

    const errors = result.errors;
    if (errors && errors.length > 0) {
      console.error(
        'Erreur lors de la suppression de certaines images:',
        errors,
      );
      return {
        message: `Des erreurs sont survenues lors de la suppression des images.`,
      };
    }

    return { message: 'Les images ont été supprimées avec succès.' };
  } catch (error) {
    console.error('Cloudinary Error: Failed to delete images.', error);
    return {
      message: 'Erreur lors de la suppression des images dans Cloudinary.',
    };
  }
}
