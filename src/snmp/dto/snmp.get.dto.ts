import { IsArray, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class HostConfig {
  @IsString()
  @ApiProperty({
    example: '127.0.0.1',
    description: 'SNMP agent host/IP address',
  })
  host: string;

  @IsString()
  @ApiProperty({
    example: 'public',
    description: 'Community string for this host',
  })
  community: string;

  @IsNumber()
  @ApiPropertyOptional({
    example: 1161,
    description: 'SNMP port for this host (optional)',
  })
  @IsOptional()
  port?: number;
}

export class SnmpGetDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => HostConfig)
  @ApiProperty({
    example: [
      { host: '127.0.0.1', community: 'public', port: 2161 },
      { host: 'localhost', community: 'pendekarkambing', port: 2161 }
    ],
    description: 'Array of host configurations',
    type: [HostConfig],
  })
  hosts: HostConfig[];

  @IsArray()
  @ApiProperty({
    example: ['1.3.6.1.2.1.1.3.0','1.3.6.1.2.1.1.5.0'],
    description: 'List of OIDs to fetch',
    type: [String],
  })
  oids: string[];
  
}
