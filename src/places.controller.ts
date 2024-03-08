import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Sequelize } from 'sequelize-typescript';
import { Place } from './places.model';
import { Identifier } from 'sequelize';

@Controller('places')
export class PlacesController {
  constructor(
    @InjectModel(Place) private readonly place: typeof Place,
    private readonly sequelize: Sequelize,
  ) {}

  @Get('nearby')
  async findNearby(
    @Query('latitude') latitude: number,
    @Query('longitude') longitude: number,
    @Query('radius') radius: number,
  ): Promise<Place[]> {
    const nearbyPlaces = await this.sequelize.query(
      `
      SELECT *
      FROM "Places"
      WHERE ST_DWithin(
        ST_MakePoint(:longitude, :latitude)::geography,
        ST_MakePoint("Places"."longitude", "Places"."latitude")::geography,
        :radius,
        true
      )
      `,
      {
        replacements: { latitude, longitude, radius },
        model: Place,
      },
    );

    return nearbyPlaces;
  }

  @Get(':id')
  async findById(@Param('id') id: Identifier): Promise<Place> {
    return this.place.findByPk(id);
  }

  @Get()
  async findAll(): Promise<Place[]> {
    return this.place.findAll();
  }

  @Post()
  async create(@Body() data: any): Promise<Place> {
    return this.place.create(data);
  }
}
