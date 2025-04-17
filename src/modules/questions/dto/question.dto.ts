import { ApiProperty } from "@nestjs/swagger";
import { Exclude, Transform, Expose, Type } from 'class-transformer';
import { IQuestion, IQuestionDB, IQuestionFullDetails, IQuestionImage, IQuestionListItem, IQuestionOption } from "question-bank-interface";

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

export class QuestionBasicDto implements IQuestionDB {
  id: string;
  questionText: string;
  marks: number;
  difficultyLevel: string;
  questionType: string;

  @Exclude()
  subjectId: string;

  @Exclude()
  topicId: string;

  @Exclude()
  classId: string;
  
  @Exclude()
  createdAt: Date;
  
  @Exclude()
  updatedAt: Date;
  
  constructor(partial: Partial<QuestionBasicDto>) {
    Object.assign(this, partial);
  }
}

export class QuestionDto implements IQuestion {
  id: string;
  questionText: string;
  marks: number;
  difficultyLevel: string;
  questionType: string;
  subject: string;
  topic: string;
  className: string;
  
  @Exclude()
  createdAt: Date;
  
  @Exclude()
  updatedAt: Date;
  
  constructor(partial: Partial<QuestionDto>) {
    Object.assign(this, partial);
  }
}

export class QuestionOptionResDto implements IQuestionOption {
  id: string;
  optionText: string;
  isCorrect: boolean;
}

export class QuestionImageResDto implements IQuestionImage {
  id: string;
  imageUrl: string;
}

export class QuestionFullDetailsDto implements IQuestionFullDetails {
  id: string;
  questionText: string;
  marks: number;
  difficultyLevel: string;
  questionType: string;
  subject: string;
  topic: string;
  className: string;
  
  @Type(() => QuestionOptionResDto)
  questionOptions: QuestionOptionResDto[];
  
  @Type(() => QuestionImageResDto)
  questionImages: QuestionImageResDto[];
  
  @Exclude()
  createdAt: Date;
  
  @Exclude()
  updatedAt: Date;
  
  constructor(partial: Partial<QuestionFullDetailsDto>) {
    Object.assign(this, partial);
  }
}

