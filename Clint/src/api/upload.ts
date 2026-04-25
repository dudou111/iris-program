import { uploadImage as uploadImageUtil } from '@/utils/media'

export interface UploadedImage {
  url: string
  filename: string
  size: number
}

export async function uploadPostImages(paths: string[]) {
  const uploaded: UploadedImage[] = []

  for (const path of paths) {
    const file = await uploadImageUtil(path, '/upload/image')
    uploaded.push(file as UploadedImage)
  }

  return uploaded
}

export async function uploadImage(path: string) {
  return await uploadImageUtil(path, '/upload/image') as UploadedImage
}
