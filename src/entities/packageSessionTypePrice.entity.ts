import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { ContractPackage } from './contractPackage.entity';
import { SessionType } from './sessionType.entity';
import { SoftDeleteBaseEntity } from './softDelete.entity';
@Entity('package_session_type_price')
export class PackageSessionTypePrice extends SoftDeleteBaseEntity{
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => ContractPackage, (contractPackage) => contractPackage.packageSessionTypePrices)
    contractPackage: ContractPackage;

    @ManyToOne(() => SessionType, (sessionType) => sessionType.packageSessionTypePrices)
    sessionType: SessionType;

    @Column({ type: 'decimal' })
    price: number;
}

