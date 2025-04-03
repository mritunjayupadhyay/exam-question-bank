import { ApiProperty } from "@nestjs/swagger";
import { QuestionType } from "src/modules/questions/dto/question.dto";

export class DifficultyPercentage {
  @ApiProperty({
    type: Number,
    description: 'Percentage of low difficulty questions',
    example: 30,
    minimum: 0,
    maximum: 100
  })
  low: number;

  @ApiProperty({
    type: Number,
    description: 'Percentage of medium difficulty questions',
    example: 40,
    minimum: 0,
    maximum: 100
  })
  medium: number;

  @ApiProperty({
    type: Number,
    description: 'Percentage of high difficulty questions',
    example: 30,
    minimum: 0,
    maximum: 100
  })
  hard: number;
}

export class QuestionSectionConfig {
  @ApiProperty({
    type: String,
    description: 'Section name',
    example: 'Answer any 5'
  })
  section: string;

  @ApiProperty({
    type: Number,
    description: 'Total marks for this section',
    example: 5
  })
  totalMarks: number;

  @ApiProperty({
    type: Number,
    description: 'Marks per question in this section',
    example: 1
  })
  marksPerQuestion: number;

  @ApiProperty({
    type: Number,
    description: 'Total questions to include in this section (more than required to answer, for choice)',
    example: 7
  })
  totalQuestions: number;

  @ApiProperty({
    enum: QuestionType,
    description: 'Type of questions to include in this section',
    example: QuestionType.MULTIPLE_CHOICE,
    required: false
  })
  questionType?: QuestionType;

  @ApiProperty({
    type: DifficultyPercentage,
    description: 'Percentage distribution of difficulty levels',
    required: false
  })
  difficultyDistribution?: DifficultyPercentage;

  @ApiProperty({
    type: [String],
    description: 'Array of topic IDs to pull questions from',
    example: ['topic-id-1', 'topic-id-2'],
    required: false
  })
  topicIds?: string[];
}

export class GenerateExamPaperDto {
  @ApiProperty({
    type: String,
    description: 'Title of the exam paper',
    example: 'Physics Final Exam - Spring 2025'
  })
  title: string;

  @ApiProperty({
    type: String,
    description: 'Exam type ID',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  examTypeId: string;

  @ApiProperty({
    type: String,
    description: 'Subject ID of the exam',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  subjectId: string;

  @ApiProperty({
    type: String,
    description: 'Class ID for which this exam is intended',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  classId: string;

  @ApiProperty({
    type: Number,
    description: 'Duration of the exam in minutes',
    example: 180
  })
  durationMinutes: number;

  @ApiProperty({
    type: [QuestionSectionConfig],
    description: 'Configuration for question sections'
  })
  sections: QuestionSectionConfig[];
}

export class GenerateQuestionForExamSectionDto {
    @ApiProperty({
      type: String,
      description: 'Subject ID of the exam',
      example: '123e4567-e89b-12d3-a456-426614174000'
    })
    subjectId: string;
  
    @ApiProperty({
      type: String,
      description: 'Class ID for which this exam is intended',
      example: '123e4567-e89b-12d3-a456-426614174000'
    })
    classId: string;

    @ApiProperty({
      type: QuestionSectionConfig,
      description: 'Configuration for question section'
    })
    section: QuestionSectionConfig;
  }