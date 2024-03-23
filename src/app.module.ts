import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { PlacesController } from './places/sportPlaces.controller';
import { SportPlace } from './places/sportPlaces.model';
@Module({
  imports: [
    SequelizeModule.forRoot({
      dialect: 'postgres',
      host: '192.168.0.10',
      port: 5432,
      username: '123',
      password: '123',
      database: 'db',
      autoLoadModels: true,
      synchronize: true,
      define: {
        timestamps: false,
      },
    }),
    SequelizeModule.forFeature([SportPlace]),
  ],
  controllers: [PlacesController],
})
export class AppModule {}
