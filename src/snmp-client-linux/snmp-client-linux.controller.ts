// src/snmp-client-linux/snmp-client-linux.controller.ts
import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { SnmpClientLinuxService } from './snmp-client-linux.service';
import { SnmpLinuxGetDto } from './dto/snmplinux.get.dto';

@ApiTags('SNMP Client Linux')
@Controller('snmp-client-linux')
export class SnmpClientLinuxController {
  constructor(private readonly snmpService: SnmpClientLinuxService) {}

  @Post('get')
  @ApiOperation({ summary: 'Perform SNMP GET request' })
  async getOid(@Body() dto: SnmpLinuxGetDto) {
    return this.snmpService.get(dto);
  }
}
