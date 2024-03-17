const { Sequelize, DataTypes } = require('sequelize');
const fs = require('fs');

const sequelize = new Sequelize({
  dialect: 'postgres',
  host: 'postgres',
  port: 5432,
  username: process.env.POSTGRES_USER || '123',
  password: process.env.POSTGRES_PASSWORD || '123',
  database: process.env.POSTGRES_DB || 'db',
});

const SportPlace = sequelize.define('SportPlace', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: DataTypes.STRING,
  type: DataTypes.STRING,
  street_address: DataTypes.STRING,
  city: DataTypes.STRING,
  postal_code: DataTypes.STRING,
  county: DataTypes.STRING,
  country: DataTypes.STRING,
  subtype: DataTypes.STRING,
  mainType: DataTypes.STRING,
  district: DataTypes.STRING,
  geom: {
    type: DataTypes.GEOMETRY('POINT', 4326),
    allowNull: true,
  },
});

async function savePlacesToDatabase(filePath) {
  try {
    await sequelize.sync({ alter: true });

    const geojsonData = fs.readFileSync(filePath, 'utf8');
    const features = JSON.parse(geojsonData).Features;

    let size = features.length;
    let i = 0;
    for (const feature of features) {
      const coordinates = feature.geometry.coordinates;
      const properties = feature.properties;

      let latitude, longitude;

      if (
        feature.geometry.type === 'LineString' ||
        feature.geometry.type === 'Polygon'
      ) {
        console.log(`Skipping feature ${i + 1}/${size} as it's not a Point`);
        i++;
        continue;
      }

      const geom = { type: 'Point', coordinates: coordinates };

      await SportPlace.create({
        name: properties['Nimi suomeksi'],
        type: properties['Liikuntapaikkatyyppi'],
        street_address: properties['Katuosoite'],
        city: properties['Kunta'],
        postal_code: properties['Postinumero'],
        county: properties['Maakunta'],
        country: properties['AVI-alue'],
        subtype: properties['Liikuntapaikkatyypin alaryhmä'],
        mainType: properties['Liikuntapaikkatyypin pääryhmä'],
        district: properties['Kuntaosa'],
        geom,
      });

      i++;
      console.log(`Added row ${i}/${size}`);
    }

    console.log('Data from GeoJSON file inserted into database.');

    // Create spatial index
    await SportPlace.sequelize.query(
      'CREATE INDEX IF NOT EXISTS idx_coordinates ON "SportPlaces" USING GIST ("geom");',
    );

    console.log('Spatial index created.');
  } catch (error) {
    console.error('Error saving places to database:', error);
  }
}

savePlacesToDatabase('places.geojson');
