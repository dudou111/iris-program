import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { SearchService } from './search.service';
import { SearchQueryDto } from './dto/search-query.dto';

@ApiTags('搜索')
@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get()
  @ApiOperation({ summary: '统一搜索' })
  search(@Query() query: SearchQueryDto) {
    return this.searchService.search(
      query.q,
      query.type || 'all',
      query.page || 1,
      query.limit || 10,
    );
  }
}
