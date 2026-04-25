import { ValidationPipe } from '@nestjs/common';
import { CreateActivityDto } from './create-activity.dto';

describe('CreateActivityDto', () => {
  it('accepts ISO 8601 start and end times through the global validation pipe', async () => {
    const validationPipe = new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    });

    const payload = {
      title: '活动标题',
      description: '活动描述',
      images: ['https://example.com/activity.png'],
      category: 'lecture',
      location: '图书馆报告厅',
      startTime: '2026-05-01T10:00:00.000Z',
      endTime: '2026-05-01T12:00:00.000Z',
      maxParticipants: 100,
    };

    await expect(
      validationPipe.transform(payload, {
        type: 'body',
        metatype: CreateActivityDto,
      }),
    ).resolves.toEqual(expect.objectContaining(payload));
  });
});
