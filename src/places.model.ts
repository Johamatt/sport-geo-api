import { Table, Column, Model } from 'sequelize-typescript';

@Table
export class PlaceModel extends Model<PlaceModel> {
  @Column
  name: string;

  @Column
  description: string;

}
