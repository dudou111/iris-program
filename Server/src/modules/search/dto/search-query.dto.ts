import { Type } from 'class-transformer';
import { IsIn, IsOptional, IsString, Min } from 'class-validator';

export class SearchQueryDto {
  @IsString()
  q: string;

  @IsOptional()
  @IsIn(['all', 'posts', 'users', 'resources'])
  type?: 'all' | 'posts' | 'users' | 'resources';

  @IsOptional()
  @Type(() => Number)
  @Min(1)
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @Min(1)
  limit?: number;
}
