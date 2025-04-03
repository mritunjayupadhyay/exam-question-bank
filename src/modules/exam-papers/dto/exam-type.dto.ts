import { ApiProperty } from "@nestjs/swagger";

export class CreateExamTypeDto {
    @ApiProperty({
        type: String,
        description: 'Exam type name',
        example: 'Final Exam'
    })
    name: string;
}

export class UpdateExamTypeDto {
    @ApiProperty({
        type: String,
        description: 'Exam type name',
        example: 'Mid-Term Exam',
        required: false
    })
    name?: string;
}