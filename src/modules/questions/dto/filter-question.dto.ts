import { ApiProperty } from "@nestjs/swagger";
import { DifficultyLevel, QuestionType } from "./question.dto";

export class QuestionFilterDto {
    @ApiProperty({
      type: String,
      description: 'Filter by subject ID',
      required: false
    })
    subjectId?: string;
  
    @ApiProperty({
      type: String,
      description: 'Filter by topic ID',
      required: false
    })
    topicId?: string;
  
    @ApiProperty({
      type: String,
      description: 'Filter by class ID',
      required: false
    })
    classId?: string;
  
    @ApiProperty({
      enum: DifficultyLevel,
      description: 'Filter by difficulty level',
      required: false
    })
    difficultyLevel?: DifficultyLevel;
  
    @ApiProperty({
      enum: QuestionType,
      description: 'Filter by question type',
      required: false
    })
    questionType?: QuestionType;
  
    @ApiProperty({
      type: Number,
      description: 'Filter by minimum marks',
      required: false
    })
    minMarks?: number;
  
    @ApiProperty({
      type: Number,
      description: 'Filter by maximum marks',
      required: false
    })
    maxMarks?: number;
  }