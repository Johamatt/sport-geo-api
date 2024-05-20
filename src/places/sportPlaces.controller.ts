import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Sequelize } from 'sequelize-typescript';
import { SportPlace } from './sportPlaces.model';
import { ApiBody, ApiTags, ApiQuery } from '@nestjs/swagger';
import { CreateSportPlaceDto } from './dto/CreatePlaceDTO';
import { Feature, Point, FeatureCollection } from 'geojson';

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
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 10 })
  @Get('nearby')
  async findNearby(
    @Query('latitude') latitude: number,
    @Query('longitude') longitude: number,
    @Query('radius') radius: number,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ): Promise<SportPlace[]> {
    try {
      const offset = (page - 1) * limit;
      const nearbyPlaces = await SportPlace.findAll({
        attributes: [
          'id',
          'name',
          'type',
          [
            Sequelize.literal(`CAST(ST_Distance(
              "SportPlace"."geom",
              ST_SetSRID(ST_MakePoint(${longitude}, ${latitude}), 4326)::geography
            ) AS INTEGER)`),
            'distance',
          ],
        ],
        where: Sequelize.literal(`ST_DWithin(
          "SportPlace"."geom",
          ST_SetSRID(ST_MakePoint(${longitude}, ${latitude}), 4326)::geography,
          ${radius}
        )`),
        order: Sequelize.literal('distance ASC'),
        offset,
        limit,
      });

      return nearbyPlaces;
    } catch (error) {
      console.error('Error finding nearby places:', error);
      throw error;
    }
  }

  @ApiQuery({ name: 'page', required: true, example: 1 })
  @ApiQuery({ name: 'limit', required: true, example: 10 })
  @ApiQuery({ name: 'type', required: false, example: 'Kuntosali' })
  @ApiQuery({ name: 'city', required: false, example: 'Helsinki' })
  @Get()
  async findAll(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('type') type?: string,
    @Query('city') city?: string,
  ): Promise<Partial<SportPlace>[]> {
    const whereClause: any = {};
    if (type) {
      whereClause.type = type;
    }

    if (city) {
      whereClause.city = city;
    }

    const rows = await this.sportPlace.findAll({
      where: whereClause,
      limit: limit,
      offset: (page - 1) * limit,
      attributes: ['id', 'name', 'type', 'city'],
    });

    return rows;
  }

  @ApiBody({ type: CreateSportPlaceDto })
  @Post()
  async create(@Body() data: any): Promise<SportPlace> {
    return this.sportPlace.create(data);
  }

  @Get('map/findAllGeoJson')
  async findAllGeoJson(): Promise<FeatureCollection<Point>> {
    const rows = await this.sportPlace.findAll({
      attributes: [
        'id',
        'name',
        'geom',
        'mainType',
        'type',
        'subtype',
        'street_address',
      ],
    });

    const features: Feature<Point>[] = rows.map((place: SportPlace) => {
      return {
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [place.geom.coordinates[0], place.geom.coordinates[1]],
        },
        properties: {
          id: place.id,
          name: place.name,
          type: place.type,
        },
      };
    });

    return {
      type: 'FeatureCollection',
      crs: {
        type: 'name',
        properties: {
          name: 'EPSG:4326',
        },
      },
      features: features,
    };
  }
}
