import { Module } from '@nestjs/common';
import { SnmpService } from './snmp.service';
import { SnmpController } from './snmp.controller';

@Module({
  providers: [SnmpService],
  controllers: [SnmpController]
})
export class SnmpModule {}
