import { ApiProperty } from "@nestjs/swagger";
import { Exclude } from "class-transformer";
import { IName } from "question-bank-interface";

export class CreateTopicDto {
    @ApiProperty({
        type: String,
        description: 'Topic name',
        example: 'Mechanics'
    })
    name: string;

    @ApiProperty({
        type: String,
        description: 'Subject ID this topic belongs to',
        example: '123e4567-e89b-12d3-a456-426614174000'
    })
    subjectId: string;
}

export class UpdateTopicDto {
    @ApiProperty({
        type: String,
        description: 'Topic name',
        example: 'Mechanics',
        required: false
    })
    name?: string;

    @ApiProperty({
        type: String,
        description: 'Subject ID this topic belongs to',
        example: '123e4567-e89b-12d3-a456-426614174000',
        required: false
    })
    subjectId?: string;
}

export class TopicDto implements IName {
    id: string;
    name: string;
    @Exclude()
    createdAt: Date;

    @Exclude()
    updatedAt: Date;
    constructor(partial: Partial<TopicDto>) {
        Object.assign(this, partial);
      }
}