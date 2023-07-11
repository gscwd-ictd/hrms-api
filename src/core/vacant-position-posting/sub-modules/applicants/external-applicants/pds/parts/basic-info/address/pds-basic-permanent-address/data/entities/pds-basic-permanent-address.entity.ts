import { Entity } from "typeorm";
import { PDSBasicAddress } from "../../../data/entity/pds-basic-address.entity";

@Entity({name: 'pds_basic_permanent_address'})
export class PDSBasicPermanentAddress extends PDSBasicAddress{
}