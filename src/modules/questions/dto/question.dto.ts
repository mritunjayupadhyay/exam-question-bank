import { ApiProperty } from "@nestjs/swagger";

export enum DifficultyLevel {
  LOW = 'low',
  MEDIUM = 'medium',
  HARD = 'hard'
}

export enum QuestionType {
  MULTIPLE_CHOICE = 'multiple_choice',
  DESCRIPTIVE = 'descriptive'
}

export class QuestionOptionDto {
  @ApiProperty({
    type: String,
    description: 'Option text',
    example: 'The sun'
  })
  optionText: string;

  @ApiProperty({
    type: Boolean,
    description: 'Whether this option is correct',
    example: true
  })
  isCorrect: boolean;
}

export class QuestionImageDto {
  @ApiProperty({
    type: String,
    description: 'URL to the image',
    example: 'https://example.com/images/question1.jpg'
  })
  imageUrl: string;
}



