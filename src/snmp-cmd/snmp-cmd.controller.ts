import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { SnmpCmdService } from './snmp-cmd.service';
import { SnmpRequestDto } from './dto/snmp.request.dto';

@ApiTags('snmp-cmd')
@Controller('snmp-cmd')
export class SnmpCmdController {
    constructor(private readonly snmpCmdService: SnmpCmdService) {}

  @Post('get')
  @ApiOperation({
    summary: 'Get SNMP values',
    description: 'Retrieve multiple SNMP values from the specified host with response metadata',
  })
  @ApiBody({ type: SnmpRequestDto })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved SNMP values',
    schema: {
      example: {
        'localhost:pendekarkambing': {
          community: 'pendekarkambing',
          data: {
            reachable: true,
            responseTimeMs: 13,
            data: [
              { oid: '1.3.6.1.2.1.1.3.0', value: 1233456 },
              {
                oid: '1.3.6.1.2.1.1.5.0',
                value: 'PENDEKARKAMBING.JRC.ssh.tm.my',
              },
            ],
          },
        },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Bad request - Invalid input' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async getSnmpValue(@Body() dto: SnmpRequestDto) {
    const data = await this.snmpCmdService.getSnmpData(dto);
    return data;
  }
}
