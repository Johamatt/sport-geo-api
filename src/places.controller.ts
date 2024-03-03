import { Controller, Get, Post, Body, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Sequelize } from 'sequelize-typescript';
import { PlaceModel } from './places.model';
import { PlaceService } from './place.service';

@Controller('places')
export class PlacesController implements OnModuleInit {
  constructor(
    @InjectModel(PlaceModel) private readonly placeModel: typeof PlaceModel,
    private readonly sequelize: Sequelize,
    private readonly placeService: PlaceService,
  ) {}

  async onModuleInit() {
    await this.importPlaces(); // Trigger the import process when the module initializes
  }

  @Get()
  async findAll(): Promise<PlaceModel[]> {
    return this.placeModel.findAll();
  }

  @Post()
  async create(@Body() data: any): Promise<PlaceModel> {
    return this.placeModel.create(data);
  }

  private async importPlaces(): Promise<void> {
    await this.placeService.savePlacesToDatabase('../dist/places.geojson'); // Trigger the import process
  }
}
