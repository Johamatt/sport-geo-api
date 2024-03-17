import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Sequelize } from 'sequelize-typescript';
import { Place } from './places.model';
import { Identifier } from 'sequelize';
import { ApiBody, ApiParam, ApiTags, ApiQuery } from '@nestjs/swagger';
import { CreatePlaceDto } from './dto/CreatePlaceDTO';
import { QueryTypes } from 'sequelize';

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
    try {
      const nearbyPlaces = await Place.findAll({
        where: Sequelize.literal(`ST_DWithin(
          "Place"."geom",
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

  @ApiQuery({ name: 'latitude', required: true, example: 60.240691 })
  @ApiQuery({ name: 'longitude', required: true, example: 24.847974 })
  @ApiQuery({ name: 'radius', required: true, example: 500 })
  @Get('clusters')
  async findClusters(
    @Query('latitude') latitude: number,
    @Query('longitude') longitude: number,
    @Query('radius') radius: number,
  ) {
    const clustersQuery = `
    SELECT 
      latitude, 
      longitude,
      count(*) as point_count
    FROM Places
    WHERE ST_DWithin(
      ST_MakePoint($2, $1)::geography,
      geom::geography,
      $3,
      true
    )
    GROUP BY latitude, longitude
    HAVING count(*) > 1;
  `;

    const pointsQuery = `
    SELECT 
      id, 
      name, 
      latitude, 
      longitude, 
      type, 
      street_address, 
      city, 
      postal_code, 
      county, 
      country, 
      subtype, 
      mainType, 
      district, 
      geom
    FROM Places
    WHERE ST_DWithin(
      ST_MakePoint($2, $1)::geography,
      geom::geography,
      $3,
      true
    )
    AND id NOT IN (
      SELECT id
      FROM (
        SELECT 
          id, 
          ST_MakePoint(longitude, latitude)::geography AS point
        FROM Places
      ) AS subquery
      WHERE ST_DWithin(
        ST_MakePoint($2, $1)::geography,
        subquery.point,
        $3,
        true
      )
      GROUP BY id
      HAVING count(*) > 1
    );
  `;

    try {
      const [clusters, points] = await Promise.all([
        this.sequelize.query(clustersQuery, {
          bind: [latitude, longitude, radius],
          type: QueryTypes.SELECT,
        }),
        this.sequelize.query(pointsQuery, {
          bind: [latitude, longitude, radius],
          type: QueryTypes.SELECT,
        }),
      ]);

      return { clusters, points };
    } catch (error) {
      console.error('Error querying database:', error);
      throw error;
    }
  }
}
