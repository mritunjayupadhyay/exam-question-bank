import { ApiProperty } from "@nestjs/swagger";
import { DifficultyLevel, QuestionImageDto, QuestionOptionDto, QuestionType } from "./question.dto";

export class CreateQuestionDto {
    @ApiProperty({
      type: String,
      description: 'Question text',
      example: 'What is the center of our solar system?'
    })
    questionText: string;
  
    @ApiProperty({
      type: Number,
      description: 'Marks awarded for this question',
      example: 5
    })
    marks: number;
  
    @ApiProperty({
      enum: DifficultyLevel,
      description: 'Difficulty level of the question',
      example: DifficultyLevel.MEDIUM
    })
    difficultyLevel: DifficultyLevel;
  
    @ApiProperty({
      enum: QuestionType,
      description: 'Type of question',
      example: QuestionType.MULTIPLE_CHOICE
    })
    questionType: QuestionType;
  
    @ApiProperty({
      type: String,
      description: 'Subject ID this question belongs to',
      example: 'f46b6a8d-90f3-430d-8f30-fbd5171ec0fd'
    })
    subjectId: string;
  
    @ApiProperty({
      type: String,
      description: 'Topic ID this question belongs to',
      example: '64961cfb-47f7-4f54-b3a6-560d6c74a5f8'
    })
    topicId: string;
  
    @ApiProperty({
      type: String,
      description: 'Class ID this question belongs to',
      example: 'd527da5d-379d-4de2-b5ff-ecccb9628a3b'
    })
    classId: string;
  
    @ApiProperty({
      type: [QuestionOptionDto],
      description: 'Options for multiple choice questions',
      required: false
    })
    options?: QuestionOptionDto[];
  
    @ApiProperty({
      type: [QuestionImageDto],
      description: 'Images related to the question',
      required: false
    })
    images?: QuestionImageDto[];
  }
  
  export class UpdateQuestionDto {
    @ApiProperty({
      type: String,
      description: 'Question text',
      example: 'What is the center of our solar system?',
      required: false
    })
    questionText?: string;
  
    @ApiProperty({
      type: Number,
      description: 'Marks awarded for this question',
      example: 5,
      required: false
    })
    marks?: number;
  
    @ApiProperty({
      enum: DifficultyLevel,
      description: 'Difficulty level of the question',
      example: DifficultyLevel.MEDIUM,
      required: false
    })
    difficultyLevel?: DifficultyLevel;
  
    @ApiProperty({
      enum: QuestionType,
      description: 'Type of question',
      example: QuestionType.MULTIPLE_CHOICE,
      required: false
    })
    questionType?: QuestionType;
  
    @ApiProperty({
      type: String,
      description: 'Subject ID this question belongs to',
      example: '123e4567-e89b-12d3-a456-426614174000',
      required: false
    })
    subjectId?: string;
  
    @ApiProperty({
      type: String,
      description: 'Topic ID this question belongs to',
      example: '123e4567-e89b-12d3-a456-426614174000',
      required: false
    })
    topicId?: string;
  
    @ApiProperty({
      type: String,
      description: 'Class ID this question belongs to',
      example: '123e4567-e89b-12d3-a456-426614174000',
      required: false
    })
    classId?: string;
  }