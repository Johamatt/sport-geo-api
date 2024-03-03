import { Controller, Get, Post, Body } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Sequelize } from 'sequelize-typescript'; // Import Sequelize types
import { PlaceModel } from './places.model';

@Controller('places')
export class PlacesController {
  constructor(
    @InjectModel(PlaceModel) private readonly yourModel: typeof PlaceModel,
    private readonly sequelize: Sequelize,
  ) {}

  @Get()
  async findAll(): Promise<PlaceModel[]> {
    return this.yourModel.findAll();
  }

  @Post()
  async create(@Body() data: any): Promise<PlaceModel> {
    return this.yourModel.create(data);
  }
}
