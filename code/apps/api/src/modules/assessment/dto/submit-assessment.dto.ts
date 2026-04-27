import { IsString, IsArray, ArrayMinSize, ValidateNested, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

class AnswerDto {
  @IsString()
  questionId!: string;

  @IsString()
  optionId!: string;
}

export class SubmitAssessmentDto {
  @IsString()
  sceneId!: string;

  @IsOptional()
  @IsString()
  depth?: string;

  @IsArray()
  @ArrayMinSize(1, { message: '至少需要提交一个答案' })
  @ValidateNested({ each: true })
  @Type(() => AnswerDto)
  answers!: AnswerDto[];
}
