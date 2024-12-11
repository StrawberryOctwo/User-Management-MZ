import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { ContractPackage } from './contractPackage.entity';
import { Discount } from './discount.entity';
import { SoftDeleteBaseEntity } from './softDelete.entity';
@Entity('package_discount_price')
export class PackageDiscountPrice extends SoftDeleteBaseEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => ContractPackage, (contractPackage) => contractPackage.packageDiscountPrices)
    contractPackage: ContractPackage;

    @ManyToOne(() => Discount, (discount) => discount.packageDiscountPrices)
    discount: Discount;

    @Column({ type: 'decimal' })
    price: number;
}

