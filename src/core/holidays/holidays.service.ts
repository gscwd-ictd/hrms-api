import { HttpException, Inject, Injectable } from "@nestjs/common";
import { ClientProxy } from "@nestjs/microservices";
import { lastValueFrom } from "rxjs";
import { MicroserviceType } from "src/global/utils/enums/microservice-type.enum";

@Injectable()
export class HolidaysService{
    constructor(@Inject(MicroserviceType.EMPLOYEE_MONITORING) private readonly client: ClientProxy){}

    async getHoliday()
    {
        try{
            return await lastValueFrom(this.client.send({ msg: 'get_holidays_for_the_year'},{}));
        }catch(error){
            throw new HttpException(error.message,error.status);
        }
       
    }
}