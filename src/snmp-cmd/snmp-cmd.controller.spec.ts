import { Test, TestingModule } from '@nestjs/testing';
import { SnmpCmdController } from './snmp-cmd.controller';

describe('SnmpCmdController', () => {
  let controller: SnmpCmdController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SnmpCmdController],
    }).compile();

    controller = module.get<SnmpCmdController>(SnmpCmdController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
