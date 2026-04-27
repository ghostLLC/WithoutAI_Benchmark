import { IsString, IsArray, ValidateNested, ArrayMinSize } from 'class-validator';
import { Type } from 'class-transformer';

class ConverseMessageDto {
  @IsString()
  role!: 'ai' | 'user';

  @IsString()
  content!: string;
}

export class ConverseDto {
  @IsString()
  sceneId!: string;

  @IsString()
  sceneName!: string;

  @IsArray()
  @IsString({ each: true })
  focusCapabilities!: string[];

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => ConverseMessageDto)
  history!: ConverseMessageDto[];
}
