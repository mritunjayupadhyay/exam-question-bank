import { ApiProperty } from "@nestjs/swagger";
import { Exclude } from "class-transformer";
import { IName } from "question-bank-interface";

export class CreateClassesDto {
    @ApiProperty({
        type: String,
        default: 'Physics'
    })
    name: string;
}

export class ClassDto implements IName {
    id: string;
    name: string;
    @Exclude()
    createdAt: Date;

    @Exclude()
    updatedAt: Date;
    constructor(partial: Partial<ClassDto>) {
        Object.assign(this, partial);
      }
}