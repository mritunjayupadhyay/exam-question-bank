import { ApiProperty } from "@nestjs/swagger";

export class ExamPaperQuestionDto {
  @ApiProperty({
    type: String,
    description: 'ID of the question to include in the exam',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  questionId: string;

  @ApiProperty({
    type: Number,
    description: 'Question number in the exam paper',
    example: 1
  })
  questionNumber: number;

  @ApiProperty({
    type: String,
    description: 'Section of the exam paper (e.g., "A", "Multiple Choice", etc.)',
    example: 'Section A',
    required: false
  })
  section?: string;
}

export class CreateExamPaperDto {
  @ApiProperty({
    type: String,
    description: 'Title of the exam paper',
    example: 'Physics Final Exam - Spring 2025'
  })
  title: string;

  @ApiProperty({
    type: String,
    description: 'Exam type ID',
    example: 'f4acfd8b-69a7-4824-9986-d3a30cd353eb'
  })
  examTypeId: string;

  @ApiProperty({
    type: String,
    description: 'Subject ID of the exam',
    example: 'f46b6a8d-90f3-430d-8f30-fbd5171ec0fd'
  })
  subjectId: string;

  @ApiProperty({
    type: String,
    description: 'Class ID for which this exam is intended',
    example: 'd527da5d-379d-4de2-b5ff-ecccb9628a3b'
  })
  classId: string;

  @ApiProperty({
    type: Number,
    description: 'Total marks for the exam',
    example: 100
  })
  totalMarks: number;

  @ApiProperty({
    type: Number,
    description: 'Duration of the exam in minutes',
    example: 180
  })
  durationMinutes: number;

  @ApiProperty({
    type: [ExamPaperQuestionDto],
    description: 'Questions to include in the exam paper',
    required: false
  })
  questions?: ExamPaperQuestionDto[];
}

export class UpdateExamPaperDto {
  @ApiProperty({
    type: String,
    description: 'Title of the exam paper',
    example: 'Physics Final Exam - Spring 2025',
    required: false
  })
  title?: string;

  @ApiProperty({
    type: String,
    description: 'Exam type ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: false
  })
  examTypeId?: string;

  @ApiProperty({
    type: String,
    description: 'Subject ID of the exam',
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: false
  })
  subjectId?: string;

  @ApiProperty({
    type: String,
    description: 'Class ID for which this exam is intended',
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: false
  })
  classId?: string;

  @ApiProperty({
    type: Number,
    description: 'Total marks for the exam',
    example: 100,
    required: false
  })
  totalMarks?: number;

  @ApiProperty({
    type: Number,
    description: 'Duration of the exam in minutes',
    example: 180,
    required: false
  })
  durationMinutes?: number;
}

export class ExamPaperFilterDto {
  @ApiProperty({
    type: String,
    description: 'Filter by exam type ID',
    required: false
  })
  examTypeId?: string;

  @ApiProperty({
    type: String,
    description: 'Filter by subject ID',
    required: false
  })
  subjectId?: string;

  @ApiProperty({
    type: String,
    description: 'Filter by class ID',
    required: false
  })
  classId?: string;

  @ApiProperty({
    type: Number,
    description: 'Filter by minimum total marks',
    required: false
  })
  minTotalMarks?: number;

  @ApiProperty({
    type: Number,
    description: 'Filter by maximum total marks',
    required: false
  })
  maxTotalMarks?: number;

  @ApiProperty({
    type: Number,
    description: 'Filter by minimum duration in minutes',
    required: false
  })
  minDurationMinutes?: number;

  @ApiProperty({
    type: Number,
    description: 'Filter by maximum duration in minutes',
    required: false
  })
  maxDurationMinutes?: number;
}

export class AddQuestionToExamPaperDto {
  @ApiProperty({
    type: String,
    description: 'ID of the question to add to the exam paper',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  questionId: string;

  @ApiProperty({
    type: Number,
    description: 'Question number in the exam paper',
    example: 5
  })
  questionNumber: number;

  @ApiProperty({
    type: String,
    description: 'Section of the exam paper',
    example: 'Section B',
    required: false
  })
  section?: string;
}

export class UpdateExamPaperQuestionDto {
  @ApiProperty({
    type: Number,
    description: 'New question number',
    example: 6,
    required: false
  })
  questionNumber?: number;

  @ApiProperty({
    type: String,
    description: 'New section',
    example: 'Section C',
    required: false
  })
  section?: string;
}