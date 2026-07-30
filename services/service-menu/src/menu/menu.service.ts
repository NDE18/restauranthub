import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { MenuItem, MenuItemDocument } from './schemas/menu-item.schema';
import { CreateMenuItemDto, UpdateAvailabilityDto } from './dto/create-menu-item.dto';
import { MenuGateway } from './menu.gateway';

@Injectable()
export class MenuService {
  constructor(
    @InjectModel(MenuItem.name) private menuItemModel: Model<MenuItemDocument>,
    private readonly menuGateway: MenuGateway,
  ) {}

  async findByRestaurant(restaurantId: string): Promise<MenuItem[]> {
    return this.menuItemModel
      .find({ restaurantId })
      .sort({ sortOrder: 1, categoryId: 1 })
      .exec();
  }

  async findByRestaurantFiltered(
    restaurantId: string,
    category?: string,
    tags?: string[],
  ): Promise<MenuItem[]> {
    const filter: Record<string, unknown> = { restaurantId };
    if (category) filter.categoryId = category;
    if (tags?.length) filter.tags = { $in: tags };
    return this.menuItemModel.find(filter).sort({ sortOrder: 1 }).exec();
  }

  async findById(id: string): Promise<MenuItem> {
    const item = await this.menuItemModel.findById(id).exec();
    if (!item) throw new NotFoundException(`Plat introuvable : ${id}`);
    return item;
  }

  async create(dto: CreateMenuItemDto): Promise<MenuItem> {
    const created = new this.menuItemModel(dto);
    const saved = await created.save();
    return saved;
  }

  async updateAvailability(
    id: string,
    dto: UpdateAvailabilityDto,
  ): Promise<MenuItem> {
    const item = await this.menuItemModel
      .findByIdAndUpdate(id, { available: dto.available }, { new: true })
      .exec();

    if (!item) throw new NotFoundException(`Plat introuvable : ${id}`);

    // Diffusion temps réel via WebSocket
    this.menuGateway.broadcastAvailabilityChange(
      item.restaurantId,
      id,
      dto.available,
    );

    return item;
  }

  async deleteByRestaurant(restaurantId: string): Promise<void> {
    await this.menuItemModel.deleteMany({ restaurantId }).exec();
  }
}
