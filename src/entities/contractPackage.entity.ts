import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToOne, CreateDateColumn } from 'typeorm';
import { PackageSessionTypePrice } from './packageSessionTypePrice.entity';
import { PackageDiscountPrice } from './packageDiscountPrice.entity';
import { Franchise } from './franchise.entity';
import { Student } from './student.entity';
import { SoftDeleteBaseEntity } from './softDelete.entity';
@Entity('contract_package')
export class ContractPackage extends SoftDeleteBaseEntity{
    @PrimaryGeneratedColumn()
    id: number;

    
    @Column()
    name: string;

    
    @Column()
    contractName: string;

    @Column({ type: 'decimal', nullable: true })
    monthlyFee: number;

    @Column({ type: 'decimal', nullable: true })
    oneTimeFee: number;


    @Column({ default: false })
    isVatExempt: boolean;

    @Column({ type: 'decimal', default: 19 })
    vatPercentage: number;

    @ManyToOne(() => Franchise, (franchise) => franchise.contractPackages, { nullable: true })
    franchise!: Franchise;
    
    
    @OneToMany(() => PackageSessionTypePrice, (packageSessionTypePrice) => packageSessionTypePrice.contractPackage)
    packageSessionTypePrices: PackageSessionTypePrice[];

    
    @OneToMany(() => PackageDiscountPrice, (packageDiscountPrice) => packageDiscountPrice.contractPackage)
    packageDiscountPrices: PackageDiscountPrice[];

    @OneToMany(() => Student, (student) => student.contract)
    students: Student[];


}

