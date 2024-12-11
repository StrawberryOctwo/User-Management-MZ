import { UserDto } from './userDto';
import { Location } from '../entities/location.entity';
import { Franchise } from '../entities/franchise.entity';

export class FranchiseDto {
  id!: number;
  name!: string;
  ownerName!: string;
  cardHolderName!: string;
  iban!: string;
  bic!: string;
  status!: string;
  totalEmployees!: number;
  percentage!: number;
  admins!: UserDto[];
  locations!: Location[];
  city!: string;
  address!: string;
  postalCode!: string;
  franchiseLogo!: string | null;
  phoneNumber!: string;
  emailAddress!: string;

  constructor(franchise: Franchise) {
    this.id = franchise.id;
    this.name = franchise.name;
    this.ownerName = franchise.ownerName;
    this.cardHolderName = franchise.cardHolderName;
    this.iban = franchise.iban;
    this.bic = franchise.bic;
    this.status = franchise.status;
    this.totalEmployees = franchise.totalEmployees;
    this.percentage = franchise.percentage,
    this.city = franchise.city,
    this.address = franchise.address
    this.postalCode = franchise.postalCode,
    this.franchiseLogo = franchise.franchiseLogo,
    this.phoneNumber = franchise.phoneNumber,
    this.emailAddress = franchise.emailAddress,

      this.admins = franchise.admins ? franchise.admins.map(admin => new UserDto(admin)) : [];

    this.locations = franchise.locations;
  }
}

