import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Sequelize } from 'sequelize-typescript';
import { SportPlace } from './sportPlaces.model';
import { Identifier } from 'sequelize';
import { ApiBody, ApiParam, ApiTags, ApiQuery } from '@nestjs/swagger';
import { CreateSportPlaceDto } from './dto/CreatePlaceDTO';

@ApiTags('sportplaces')
@Controller('sportPlaces')
export class PlacesController {
  constructor(
    @InjectModel(SportPlace) private readonly sportPlace: typeof SportPlace,
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
  ): Promise<SportPlace[]> {
    try {
      const nearbyPlaces = await SportPlace.findAll({
        where: Sequelize.literal(`ST_DWithin(
          "SportPlace"."geom",
          ST_MakePoint(${longitude}, ${latitude})::geography,
          ${radius}
        )`),
      });

      return nearbyPlaces;
    } catch (error) {
      console.error('Error finding nearby places:', error);
      throw error;
    }
  }

  @ApiParam({ name: 'id', type: 'string', example: '1' })
  @Get(':id')
  async findById(@Param('id') id: Identifier): Promise<SportPlace> {
    return this.sportPlace.findByPk(id);
  }

  @ApiQuery({ name: 'page', required: true, example: 1 })
  @ApiQuery({ name: 'perPage', required: true, example: 10 })
  @Get()
  async findAll(
    @Query('page') page: number = 1,
    @Query('perPage') perPage: number = 10,
  ): Promise<{ sportPlaces: SportPlace[]; total: number }> {
    const { count, rows } = await this.sportPlace.findAndCountAll({
      limit: perPage,
      offset: (page - 1) * perPage,
    });

    return {
      sportPlaces: rows,
      total: count,
    };
  }

  @ApiBody({ type: CreateSportPlaceDto })
  @Post()
  async create(@Body() data: any): Promise<SportPlace> {
    return this.sportPlace.create(data);
  }
}
