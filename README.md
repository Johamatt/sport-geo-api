

# Sports Geo API with NestJS & PostGIS
This application enables users to find the location information of sports facilities by utilizing spatial location search. The data is retrieved from [Lipas], which gathers information about sports venues from various parts of Finland.

## Swagger

Explore the API endpoints and interact with the application using Swagger UI.
Access Swagger UI: http://localhost:3000/swagger-ui#/
## Prerequisites
- [Docker] & [Node] installed on your machine

## Download data

Note that the more data you add, the longer the initial startup of the application will take, as the data is being added to the database. 

1. Download data from https://www.lipas.fi/liikuntapaikat
2. Click left bottom corner icon (Luo excel raportti hakutuloksista) 
3. Add all quick selections (Pikavalinnat)
4. Select GeoJSON from dropdown
5. Save it as places.geojson file and add it in project root folder


## Installation

```bash
$ git clone https://github.com/Johamatt/sport-geo-api.git
$ cd sport-geo-api
$ npm install
```

## Running the app

```bash
# First time setup:
$ docker compose up --build
# Wait till application starts and run script:
$ docker exec sport-geo-api-nestjs-app-1 node init_db.ts 

```

   [Docker]: <https://docs.docker.com/get-docker/>
   [Node]: <https://nodejs.org/en/download>
   [Lipas]: <https://www.lipas.fi/etusivu>