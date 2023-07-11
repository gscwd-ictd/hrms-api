import { Entity } from "typeorm";
import { PDSBasicAddress } from "../../../data/entity/pds-basic-address.entity";

@Entity({name: 'pds_basic_residential_address'})
export class PDSBasicResidentialAddress extends PDSBasicAddress{}