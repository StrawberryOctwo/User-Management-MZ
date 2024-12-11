import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { PackageDiscountPrice } from './packageDiscountPrice.entity';
import { SoftDeleteBaseEntity } from './softDelete.entity';

@Entity('discount')
export class Discount extends SoftDeleteBaseEntity{
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @OneToMany(() => PackageDiscountPrice, (packageDiscountPrice) => packageDiscountPrice.discount)
    packageDiscountPrices: PackageDiscountPrice[];
}

