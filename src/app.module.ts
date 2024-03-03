import { Module, OnModuleInit } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { PlacesController } from './places.controller';
import { PlaceModel } from './places.model';
import { PlaceService } from './place.service';

@Module({
  imports: [
    SequelizeModule.forRoot({
      dialect: 'postgres',
      host: 'postgres', // container, (docker-compose)
      port: parseInt(process.env.POSTGRES_PORT, 10) || 5432,
      username: process.env.POSTGRES_USER || '123',
      password: process.env.POSTGRES_PASSWORD || '123',
      database: process.env.POSTGRES_DB || 'db',
      autoLoadModels: true,
      synchronize: true,
    }),
    SequelizeModule.forFeature([PlaceModel]),
  ],
  controllers: [PlacesController],
  providers: [PlaceService],
})
export class AppModule implements OnModuleInit {
  constructor(private readonly placeService: PlaceService) {}

  async onModuleInit() {
    await this.placeService.savePlacesToDatabase('../dist/places.geojson'); // Trigger the import process when the module initializes
  }
}
