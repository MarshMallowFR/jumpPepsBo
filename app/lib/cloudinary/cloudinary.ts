import { v2 as cloudinary } from 'cloudinary';

// Configuration de Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function getCloudinaryPicture(
  formData: FormData,
): Promise<string> {
  let imageUrl = '';
  const picture = formData.get('picture') as File;
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

// Autre façon de faire pour la const buffer
// export async function getCloudinaryPicture(
//   formData: FormData,
// ): Promise<string> {
//   let imageUrl = '';
//   const picture = formData.get('picture') as File;
//   if (picture) {
//     const arrayBuffer = await picture.arrayBuffer();
//     const buffer = Buffer.from(new Uint8Array(arrayBuffer));
//     const result = await new Promise((resolve, reject) => {
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
//         .end(buffer);
//     });
//     imageUrl = result.secure_url;
//   }
//   return imageUrl;
// }
