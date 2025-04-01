import { ApiProperty } from "@nestjs/swagger";

export class CreateClassesDto {
    @ApiProperty({
        type: String,
        default: 'Physics'
    })
    name: string;
}