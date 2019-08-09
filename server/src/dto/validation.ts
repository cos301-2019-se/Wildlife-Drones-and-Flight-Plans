import { IsEmail, IsNotEmpty, IsEnum, IsNumber, IsOptional } from 'class-validator';


export class addUserDTO {
  @IsEmail()
  email: string;

  @IsNotEmpty()
  password: string;

  @IsNotEmpty()
  name: string;

  @IsNotEmpty()
  surname: string;

  @IsEnum(['administrator','pilot'])
  job: string;
}

export class updateUserDTO {
  
  @IsOptional()
  @IsNotEmpty()
  name:string;

  @IsOptional()
  @IsNotEmpty()
  surname:string;
  
  @IsOptional()
  @IsEmail()
  email:string;

  @IsOptional()
  @IsEnum(['administrator','pilot'])
  job:string;

  @IsOptional()
  @IsNotEmpty()
  password:string;

  @IsOptional()
  @IsNotEmpty()
  loginAttemptsRemaining:number;

  @IsOptional()
  @IsNotEmpty()
  code:string;
 
  @IsNumber()
  id: number;
}

export class deleteUserDTO {
  @IsNumber()
  id: number;
}

