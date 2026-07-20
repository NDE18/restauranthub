import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type MenuItemDocument = MenuItem & Document;

@Schema({ timestamps: true, collection: 'menu_items' })
export class MenuItem {
  @Prop({ required: true, index: true })
  restaurantId: string;

  @Prop({ required: true })
  categoryId: string;

  @Prop({ required: true })
  categoryName: string;

  @Prop({ required: true })
  name: string;

  @Prop()
  description: string;

  @Prop({ required: true, min: 0 })
  price: number;

  @Prop({ default: true, index: true })
  available: boolean;

  @Prop({ type: [String], default: [] })
  allergens: string[];

  @Prop({ type: [String], default: [] })
  tags: string[]; // vegan, sans-gluten, halal, etc.

  @Prop({ type: Object })
  nutritionalInfo: {
    calories?: number;
    proteins?: number;
    carbs?: number;
    fats?: number;
  };

  @Prop({ type: [Object], default: [] })
  options: {
    name: string;
    choices: { label: string; priceModifier: number }[];
    required: boolean;
  }[];

  @Prop({ type: Object })
  translations: Record<string, { name: string; description: string }>;

  @Prop()
  imageUrl: string;

  @Prop()
  seasonalStart: Date;

  @Prop()
  seasonalEnd: Date;

  @Prop({ default: 0 })
  sortOrder: number;
}

export const MenuItemSchema = SchemaFactory.createForClass(MenuItem);

MenuItemSchema.index({ restaurantId: 1, available: 1 });
MenuItemSchema.index({ restaurantId: 1, categoryId: 1 });
MenuItemSchema.index({ name: 'text', description: 'text' });
