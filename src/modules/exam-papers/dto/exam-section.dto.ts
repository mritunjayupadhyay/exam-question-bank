import { ApiProperty, ApiPropertyOptional, PartialType } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsString, IsUUID, IsInt, IsOptional, IsBoolean, Min, Max, IsArray, ValidateNested, ArrayMinSize } from 'class-validator';

export class CreateSectionDto {
  @ApiProperty({ description: 'Section number (display order)', minimum: 1 })
  @IsInt()
  @Min(1)
  sectionNumber: number;

  @ApiProperty({ description: 'Section title', maxLength: 200 })
  @IsString()
  title: string;

  @ApiPropertyOptional({ description: 'Instructions for this section' })
  @IsOptional()
  @IsString()
  instructions?: string;

  @ApiProperty({ description: 'Marks per question in this section', minimum: 1 })
  @IsInt()
  @Min(1)
  marksPerQuestion: number;

  @ApiProperty({ description: 'Number of questions students must answer', minimum: 1 })
  @IsInt()
  @Min(1)
  questionsToAnswer: number;

  @ApiProperty({ description: 'Total number of questions available in this section', minimum: 1 })
  @IsInt()
  @Min(1)
  totalQuestions: number;
}

export class UpdateSectionDto extends PartialType(CreateSectionDto) {
  @ApiPropertyOptional({ description: 'Section number (display order)', minimum: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  sectionNumber?: number;
}


export class AddQuestionToSectionDto {
  @ApiProperty({ description: 'Question UUID to add to the section' })
  @IsUUID()
  questionId: string;

  @ApiPropertyOptional({ description: 'Question number within the section (auto-assigned if not provided)', minimum: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  questionNumber?: number;

  @ApiPropertyOptional({ description: 'Whether this question is optional in "choose X from Y" scenarios', default: false })
  @IsOptional()
  @IsBoolean()
  isOptional?: boolean;
}

export class QuestionToAddDto {
  @ApiProperty({ description: 'Question UUID to add to the section' })
  @IsUUID()
  questionId: string;

  @ApiPropertyOptional({ description: 'Question number within the section (auto-assigned if not provided)', minimum: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  questionNumber?: number;

  @ApiPropertyOptional({ description: 'Whether this question is optional', default: false })
  @IsOptional()
  @IsBoolean()
  isOptional?: boolean;
}

export class AddMultipleQuestionsToSectionDto {
  @ApiProperty({ 
    description: 'Array of questions to add to the section',
    type: [QuestionToAddDto],
    minItems: 1
  })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => QuestionToAddDto)
  questions: QuestionToAddDto[];
}

export class UpdateQuestionInSectionDto {
  @ApiPropertyOptional({ description: 'New question number within the section', minimum: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  questionNumber?: number;

  @ApiPropertyOptional({ description: 'Whether this question is optional' })
  @IsOptional()
  @IsBoolean()
  isOptional?: boolean;
}