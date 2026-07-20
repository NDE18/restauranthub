import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { MenuService } from './menu.service';
import { CreateMenuItemDto, UpdateAvailabilityDto } from './dto/create-menu-item.dto';

@ApiTags('Menus')
@Controller('api/v1/menus')
export class MenuController {
  constructor(private readonly menuService: MenuService) {}

  @Get(':restaurantId')
  @ApiOperation({ summary: 'Menu complet d\'un établissement' })
  findAll(@Param('restaurantId') restaurantId: string) {
    return this.menuService.findByRestaurant(restaurantId);
  }

  @Get(':restaurantId/items')
  @ApiOperation({ summary: 'Recherche filtrée (catégorie, tags)' })
  findFiltered(
    @Param('restaurantId') restaurantId: string,
    @Query('category') category?: string,
    @Query('tags') tags?: string,
  ) {
    const tagList = tags ? tags.split(',') : [];
    return this.menuService.findByRestaurantFiltered(restaurantId, category, tagList);
  }

  @Get('items/:id')
  @ApiOperation({ summary: 'Détail d\'un plat' })
  findOne(@Param('id') id: string) {
    return this.menuService.findById(id);
  }

  @Patch('items/:id/availability')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Mise à jour disponibilité (temps réel)' })
  updateAvailability(
    @Param('id') id: string,
    @Body() dto: UpdateAvailabilityDto,
  ) {
    return this.menuService.updateAvailability(id, dto);
  }

  @Post(':restaurantId/items')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Créer un plat (admin)' })
  create(@Body() dto: CreateMenuItemDto) {
    return this.menuService.create(dto);
  }
}
