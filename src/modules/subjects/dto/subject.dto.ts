import { ApiProperty } from "@nestjs/swagger";
import { Exclude } from "class-transformer";
import { IName } from "question-bank-interface";

export class CreateSubjectDto {
    @ApiProperty({
        type: String,
        default: 'Physics'
    })
    name: string;
}

export class SubjectDto implements IName {
    id: string;
    name: string;
    @Exclude()
    createdAt: Date;

    @Exclude()
    updatedAt: Date;
    constructor(partial: Partial<SubjectDto>) {
        Object.assign(this, partial);
      }
}