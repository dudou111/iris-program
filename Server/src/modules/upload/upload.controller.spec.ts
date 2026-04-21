import 'reflect-metadata';
import { BadRequestException } from '@nestjs/common';
import { ROUTE_ARGS_METADATA } from '@nestjs/common/constants';
import { UploadController } from './upload.controller';

describe('UploadController', () => {
  const controller = new UploadController();

  it('binds the uploaded file interceptor payload to the handler argument', () => {
    const metadata = Reflect.getMetadata(
      ROUTE_ARGS_METADATA,
      UploadController,
      'uploadImage',
    );

    expect(metadata).toBeDefined();
    expect(Object.values(metadata)).toEqual([
      expect.objectContaining({
        index: 0,
      }),
    ]);
  });

  it('throws when file payload is missing', () => {
    expect(() => controller.uploadImage(undefined)).toThrow(BadRequestException);
  });

  it('returns normalized image metadata when file payload exists', () => {
    const result = controller.uploadImage({
      filename: 'abc.png',
      size: 1024,
    });

    expect(result).toEqual({
      url: '/uploads/images/abc.png',
      filename: 'abc.png',
      size: 1024,
    });
  });
});
