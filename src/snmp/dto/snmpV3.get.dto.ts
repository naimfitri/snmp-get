import { IsArray, IsInt, IsNotEmpty, IsOptional, IsString, Min, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum AuthProtocol {
    MD5 = 'MD5',
    SHA = 'SHA',
    SHA256 = 'SHA256',
    SHA384 = 'SHA384',
    SHA512 = 'SHA512',
}

export enum SecurityLevel {
    NOAUTHPRIV = 'authNoPriv',
    AUTHPRIV = 'authPriv',
}
 
export enum PrivProtocol {
    DES = 'des',
    AES = 'aes',
}

export class SnmpV3GetDto {

    @IsString()
    @IsNotEmpty()
    @ApiProperty({
        description: 'Target hostname or IP address',
        example: '172.0.0.1'
    })
    host: string;

    @IsArray()
    @IsNotEmpty({ each: true })
    @ApiProperty({
        description: 'Array of OIDs to query',
        example: ['1.3.6.1.2.1.1.1.0']
    })
    oids: string[];

    @IsString()
    @IsOptional()
    @ApiProperty({
        description: 'Community string for SNMPv3 (if applicable)',
        example: 'pendekarayam',
    })
    community: string;

    @IsInt()
    @Min(1)
    @ApiProperty({
        description: 'SNMP port number',
        example: 1161,
    })
    port: number;

    
    @IsString()
    @IsNotEmpty()
    @ApiProperty({
        description: 'Username for SNMPv3 authentication',
        example: 'snmpuser',
    })
    username: string;

    @ApiProperty({
        description: 'Authentication protocol',
        enum: AuthProtocol,
    })
    @IsEnum(AuthProtocol)
    authProtocol: AuthProtocol;

    
    @IsString()
    @IsNotEmpty()
    @ApiProperty({
        description: 'Authentication password',
        example: 'authPassword123',
    })
    authPassword: string;

    @ApiProperty({
        description: 'Privacy protocol',
        enum: PrivProtocol,
    })
    @IsEnum(PrivProtocol)
    privProtocol: PrivProtocol;
    
    @IsNotEmpty()
    @ApiProperty({
        description: 'Privacy password',
        example: 'privPassword123',
    })
    @IsString()
    privPassword: string;

    @ApiProperty({
        description: 'Security level',
        enum: SecurityLevel,
    })
    @IsEnum(SecurityLevel)
    securityLevel: SecurityLevel;

}





/**
Username: A unique identifier for the user (e.g., snmpuser).
Authentication Protocol: Choose between MD5 or SHA (SHA-256/384/512 preferred).
Authentication Password: A strong password (min 8 characters) for authentication.
Privacy (Encryption) Protocol: Choose DES, AES122, AES192, or AES256 (AES preferred for stronger encryption).
Privacy Password: A strong password (min 8 characters) for data encryption (if using encryption).
Security Level: Set to authNoPriv (authentication only) or authPriv (authentication & privacy/encryption). 
 */