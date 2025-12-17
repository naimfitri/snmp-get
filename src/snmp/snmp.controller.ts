import { Controller, Get, Post, Body } from '@nestjs/common';
import { SnmpService } from './snmp.service';
import { SnmpGetDto } from './dto/snmp.get.dto';
import { SnmpV3GetDto } from './dto/snmpV3.get.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';


@ApiTags('SNMP')
@Controller('snmp')
export class SnmpController {

    constructor(private readonly snmpService: SnmpService) { }

    @Post('getSnmpV2')
    @ApiOperation({ summary: 'SNMP GET (V2)' })
    @ApiBody({ type: SnmpGetDto })
    @ApiResponse({
        status: 200,
        description: 'Successful SNMP GET response',
        schema: {
            example: [
                {
                    oid: '1.3.6.1.2.1.1.1.0',
                    value: 'Linux localhost 5.15.0',
                },
            ],
        },

    })
    async getOidv2(@Body() dto: SnmpGetDto) {
        return this.snmpService.getSnmpV2(dto);
    }

    @Post('getSnmpV3')
    @ApiOperation({ summary: 'SNMP GET (V3)' })
    @ApiBody({ type: SnmpV3GetDto })
    @ApiResponse({
        status: 200,
        description: 'Successful SNMP GET response',
        schema: {
            example: [
                {
                    oid: '1.3.6.1.2.1.1.1.0',
                    value: 'Linux localhost 5.15.0',
                },
            ],
        },

    })
    async getOidv3(@Body() dto: SnmpV3GetDto) {
        return this.snmpService.getSnmpV3(dto);
    }

}
