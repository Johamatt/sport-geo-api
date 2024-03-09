import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { PlacesController } from './places/places.controller';
import { Place } from './places/places.model';

@Module({
  imports: [
    SequelizeModule.forRoot({
      dialect: 'postgres',
      host: 'postgres',
      port: parseInt(process.env.POSTGRES_PORT, 10) || 5432,
      username: process.env.POSTGRES_USER || '123',
      password: process.env.POSTGRES_PASSWORD || '123',
      database: process.env.POSTGRES_DB || 'db',
      autoLoadModels: true,
      synchronize: true,
      define: {
        timestamps: false,
      },
    }),
    SequelizeModule.forFeature([Place]),
  ],
  controllers: [PlacesController],
})
export class AppModule {}
