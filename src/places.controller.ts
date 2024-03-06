import { Controller, Get, Post, Body } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Sequelize } from 'sequelize-typescript';
import { Place } from './places.model';

@Controller('places')
export class PlacesController {
  constructor(
    @InjectModel(Place) private readonly place: typeof Place,
    private readonly sequelize: Sequelize,
  ) {}

  @Get()
  async findAll(): Promise<Place[]> {
    return this.place.findAll();
  }

  @Post()
  async create(@Body() data: any): Promise<Place> {
    return this.place.create(data);
  }
}
