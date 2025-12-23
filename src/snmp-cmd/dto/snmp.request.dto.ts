import { IsIP, IsNotEmpty, IsString, IsArray } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SnmpRequestDto {

    @ApiProperty({
        example: '192.168.1.1',
        description: 'The IP address of the SNMP host',
    })
    @IsIP()
    ip: string;

    @ApiProperty({
        example: 'public',
        description: 'The SNMP community string',
    })
    @IsString()
    @IsNotEmpty()
    community: string;

    @ApiProperty({
        example: ['1.3.6.1.2.1.1.1.0', '1.3.6.1.2.1.1.3.0'],
        description: 'Array of SNMP OIDs (Object Identifiers) to query',
        isArray: true,
    })
    @IsArray()
    @IsString({ each: true })
    @IsNotEmpty({ each: true })
    oids: string[];

}