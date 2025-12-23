import { Module } from '@nestjs/common';
import { SnmpService } from './snmp.service';
import { SnmpController } from './snmp.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { SnmpFail, SnmpFailSchema, SnmpSuccess, SnmpSuccessSchema } from './schema/snmp.log.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: SnmpFail.name, schema: SnmpFailSchema },
      { name: SnmpSuccess.name, schema: SnmpSuccessSchema }
    ]),
  ],
  providers: [SnmpService],
  controllers: [SnmpController]
})
export class SnmpModule {}
