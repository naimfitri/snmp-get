import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional, IsEnum } from 'class-validator';

export enum SnmpVersion {
    V2C = '2c',
    V3 = '3',
}

export class SnmpLinuxGetDto {

    @ApiProperty({
        description: 'SNMP Version',
        enum: SnmpVersion,
    })
    @IsEnum(SnmpVersion)
    version: SnmpVersion;

    @ApiProperty({
        description: 'Target host, e.g., 127.0.0.1'
    })
    @IsNotEmpty()
    @IsString()
    host: string;

    @ApiProperty({
        description: 'OID to query, e.g., 1.3.6.1.2.1.1.1.0'
    })
    @IsNotEmpty()
    @IsString()
    oid: string;

    @ApiProperty({
        description: 'Community string',
        required: false,
    })
    @IsOptional()
    @IsString()
    community?: string;

    @ApiProperty({
        description: 'V3 Username',
        required: false,
    })
    @IsOptional()
    @IsString()
    user?: string;
    
    @ApiProperty({
        description: 'Auth password for V3',
        required: false,
    })
    @IsOptional()
    @IsString()
    authPass?: string;

    @ApiProperty({
        description: 'Priv password for V3',
        required: false,
    })
    @IsOptional()
    @IsString()
    privPass?: string;

    

}