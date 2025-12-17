import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SnmpModule } from './snmp/snmp.module';
import { SnmpClientLinuxModule } from './snmp-client-linux/snmp-client-linux.module';

@Module({
  imports: [SnmpModule, SnmpClientLinuxModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
