import { Module } from '@nestjs/common';
import { SnmpClientLinuxService } from './snmp-client-linux.service';
import { SnmpClientLinuxController } from './snmp-client-linux.controller';

@Module({
  providers: [SnmpClientLinuxService],
  controllers: [SnmpClientLinuxController],
  exports: [SnmpClientLinuxService]
})
export class SnmpClientLinuxModule {}
