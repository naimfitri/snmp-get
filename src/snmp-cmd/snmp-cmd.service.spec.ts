import { Test, TestingModule } from '@nestjs/testing';
import { SnmpCmdService } from './snmp-cmd.service';

describe('SnmpCmdService', () => {
  let service: SnmpCmdService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SnmpCmdService],
    }).compile();

    service = module.get<SnmpCmdService>(SnmpCmdService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
