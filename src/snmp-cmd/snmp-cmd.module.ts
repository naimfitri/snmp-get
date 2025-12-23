import { Module } from '@nestjs/common';
import { SnmpCmdService } from './snmp-cmd.service';
import { SnmpCmdController } from './snmp-cmd.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { SnmpCmdFail, SnmpCmdFailSchema, SnmpCmdSuccess, SnmpCmdSuccessSchema } from './schema/snmp-cmd.log.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: SnmpCmdFail.name, schema: SnmpCmdFailSchema },
      { name: SnmpCmdSuccess.name, schema: SnmpCmdSuccessSchema }
    ]),
  ],
  providers: [SnmpCmdService],
  controllers: [SnmpCmdController]
})
export class SnmpCmdModule {}
