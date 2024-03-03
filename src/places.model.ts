import { Table, Column, Model } from 'sequelize-typescript';

@Table
export class PlaceModel extends Model<PlaceModel> {
  @Column
  name: string;

  @Column
  latitude: number;

  @Column
  longitude: number;

  @Column
  type: string;

  @Column
  street_address: string;

  @Column
  city: string;

  @Column
  postal_code: string;

  @Column
  county: string;

  @Column
  country: string;

  @Column
  subtype: string;

  @Column
  mainType: string;

  @Column
  district: string;
}
