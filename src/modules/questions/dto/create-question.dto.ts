import { ApiProperty } from "@nestjs/swagger";

export class CreateQuestionDto {
    @ApiProperty({
        type: String,
        default: 'question A'
    })
    name: string;
    @ApiProperty({
        type: String,
        default: 'a'
    })
    code: string;
}