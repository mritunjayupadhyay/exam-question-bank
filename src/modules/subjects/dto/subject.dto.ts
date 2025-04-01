import { ApiProperty } from "@nestjs/swagger";

export class CreateSubjectDto {
    @ApiProperty({
        type: String,
        default: 'Physics'
    })
    name: string;
}