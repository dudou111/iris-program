import { uploadImage } from '@/utils/media'

export interface UploadedImage {
  url: string
  filename: string
  size: number
}

export async function uploadPostImages(paths: string[]) {
  const uploaded: UploadedImage[] = []

  for (const path of paths) {
    const file = await uploadImage(path, '/upload/image')
    uploaded.push(file as UploadedImage)
  }

  return uploaded
}
