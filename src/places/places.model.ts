import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
  AutoIncrement,
} from 'sequelize-typescript';

@Table({ tableName: 'Places', timestamps: false })
export class Place extends Model<Place> {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  id: number;

  @Column(DataType.STRING)
  name: string;

  @Column(DataType.DOUBLE)
  latitude: number;

  @Column(DataType.DOUBLE)
  longitude: number;

  @Column(DataType.STRING)
  type: string;

  @Column(DataType.STRING)
  street_address: string;

  @Column(DataType.STRING)
  city: string;

  @Column(DataType.STRING)
  postal_code: string;

  @Column(DataType.STRING)
  county: string;

  @Column(DataType.STRING)
  country: string;

  @Column(DataType.STRING)
  subtype: string;

  @Column(DataType.STRING)
  mainType: string;

  @Column(DataType.STRING)
  district: string;
}
