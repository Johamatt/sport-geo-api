import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import { Client } from 'pg';
import { PlaceModel } from './places.model';

@Injectable()
export class PlaceService {
  async savePlacesToDatabase(filePath: string): Promise<void> {
    const geojsonData = fs.readFileSync(filePath, 'utf8');
    const features = JSON.parse(geojsonData).Features;

    const client = new Client({
      user: process.env.POSTGRES_USER,
      host: 'postgres',
      database: process.env.POSTGRES_DB,
      password: process.env.POSTGRES_PASSWORD,
      port: 5432,
    });

    await client.connect();

    try {
      for (const feature of features) {
        const coordinates = feature.geometry.coordinates;
        const properties = feature.properties;

        // Extract latitude and longitude, skipping altitude if present
        const latitude = coordinates[1];
        const longitude = coordinates[0];

        // Create a new PlaceModel instance with extracted data
        const place = new PlaceModel();
        place.name = properties['Nimi suomeksi'];
        place.latitude = latitude;
        place.longitude = longitude;
        place.type = properties['Liikuntapaikkatyyppi'];
        place.street_address = properties['Katuosoite'];
        place.city = properties['Kunta'];
        place.postal_code = properties['Postinumero'];
        place.county = properties['Maakunta'];
        place.country = properties['AVI-alue'];
        place.subtype = properties['Liikuntapaikkatyypin alaryhmä'];
        place.mainType = properties['Liikuntapaikkatyypin pääryhmä'];
        place.district = properties['Kuntaosa'];

        // Save the PlaceModel instance to the database
        await place.save();
      }

      // Create a spatial index on the coordinates column
      const createIndexQuery =
        'CREATE INDEX IF NOT EXISTS idx_coordinates ON PlaceModels USING GIST (coordinates)';
      await client.query(createIndexQuery);

      console.log('Data from GeoJSON file inserted into database.');
    } catch (error) {
      console.error('Error saving places to database:', error);
    } finally {
      await client.end();
    }
  }
}
