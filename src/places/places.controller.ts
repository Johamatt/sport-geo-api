import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Sequelize } from 'sequelize-typescript';
import { Place } from './places.model';
import { Identifier } from 'sequelize';
import { ApiBody, ApiParam, ApiTags, ApiQuery } from '@nestjs/swagger';
import { CreatePlaceDto } from './dto/CreatePlaceDTO';

@ApiTags('places')
@Controller('places')
export class PlacesController {
  constructor(
    @InjectModel(Place) private readonly place: typeof Place,
    private readonly sequelize: Sequelize,
  ) {}

  @ApiQuery({ name: 'latitude', required: true, example: 60.240691 })
  @ApiQuery({ name: 'longitude', required: true, example: 24.847974 })
  @ApiQuery({ name: 'radius', required: true, example: 500 })
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

  @ApiParam({ name: 'id', type: 'string', example: '1' })
  @Get(':id')
  async findById(@Param('id') id: Identifier): Promise<Place> {
    return this.place.findByPk(id);
  }

  @ApiQuery({ name: 'page', required: true, example: 1 })
  @ApiQuery({ name: 'perPage', required: true, example: 10 })
  @Get()
  async findAll(
    @Query('page') page: number = 1,
    @Query('perPage') perPage: number = 10,
  ): Promise<{ places: Place[]; total: number }> {
    const { count, rows } = await this.place.findAndCountAll({
      limit: perPage,
      offset: (page - 1) * perPage,
    });

    return {
      places: rows,
      total: count,
    };
  }

  @ApiBody({ type: CreatePlaceDto })
  @Post()
  async create(@Body() data: any): Promise<Place> {
    return this.place.create(data);
  }
}
