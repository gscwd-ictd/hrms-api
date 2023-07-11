import { IsNotEmpty, IsString, minLength } from "class-validator";

export class OrganizationalEntitiesDto{
    @IsNotEmpty()
    @IsString()
    name: string;
    
    @IsNotEmpty()
    @IsString()
    code: string;

    @IsNotEmpty()
    @IsString()
    description: string;
}