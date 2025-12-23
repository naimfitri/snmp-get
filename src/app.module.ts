import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SnmpModule } from './snmp/snmp.module';
import { SnmpClientLinuxModule } from './snmp-client-linux/snmp-client-linux.module';
import { MongooseModule } from '@nestjs/mongoose';


@Module({
  imports: [
    SnmpModule, 
    SnmpClientLinuxModule,
    MongooseModule.forRoot('mongodb://localhost:27017/snmp')
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
