import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import * as snmp from 'net-snmp';
import { SnmpV3GetDto, AuthProtocol, PrivProtocol } from './dto/snmpV3.get.dto';
import { SnmpGetDto, HostConfig } from './dto/snmp.get.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { SnmpFail, SnmpSuccess } from './schema/snmp.log.schema';

@Injectable()
export class SnmpService {
  private readonly logger = new Logger(SnmpService.name);

  constructor(
    @InjectModel(SnmpFail.name) private snmpFailModel: Model<SnmpFail>,
    @InjectModel(SnmpSuccess.name) private snmpSuccessModel: Model<SnmpSuccess>,
  ) {}

  private createV3Session(dto: SnmpV3GetDto) {
    const options = {
      port: dto.port,
      retries: 1,
      timeout: 5000,
      transport: 'udp4',
      trapPort: 162,
      version: snmp.Version3,
      context: dto.community || 'public',
    };
    this.logger.log(`Using community string: ${options.context}`);

    // Map auth protocol
    const authProtocolMap = {
      [AuthProtocol.MD5]: snmp.AuthProtocols.md5,
      [AuthProtocol.SHA]: snmp.AuthProtocols.sha,
      [AuthProtocol.SHA256]: snmp.AuthProtocols.sha256,
      [AuthProtocol.SHA384]: snmp.AuthProtocols.sha384,
      [AuthProtocol.SHA512]: snmp.AuthProtocols.sha512,
    };

    // Map priv protocol
    const privProtocolMap = {
      [PrivProtocol.DES]: snmp.PrivProtocols.des,
      [PrivProtocol.AES]: snmp.PrivProtocols.aes,
    };

    const user = {
      name: dto.username,
      level:
        dto.securityLevel === 'authPriv'
          ? snmp.SecurityLevel.authPriv
          : snmp.SecurityLevel.authNoPriv,
      authProtocol: authProtocolMap[dto.authProtocol],
      authKey: dto.authPassword,
      privProtocol: privProtocolMap[dto.privProtocol],
      privKey: dto.privPassword,
    };

    return snmp.createV3Session(dto.host, user, options);
  }

  private createV2cSession(host: string, port: number, community: string) {
    const options = {
      port: port,
      retries: 1,
      timeout: 5000,
      transport: 'udp4',
      trapPort: 162,
      version: snmp.Version2c,
    };

    const communityString = community || 'public';
    this.logger.log(`Using community string: ${communityString}`);

    return snmp.createSession(host, communityString, options);
  }

  async getSnmpV2(dto: SnmpGetDto) {
    const results = {};

    // Create promises for all hosts
    const promises = dto.hosts.map((hostConfig) => {
      const key = `${hostConfig.host}:${hostConfig.community}`;
      return this.queryHost(
        hostConfig.host,
        hostConfig.port || 1161,
        hostConfig.community,
        dto.oids,
      )
        .then((result) => {
          results[key] = {
            community: hostConfig.community,
            data: result,
          };
          
          this.logSuccess(hostConfig.host, hostConfig.community, result);

        })
        .catch((error) => {
          results[key] = {
            community: hostConfig.community,
            error: error.message,
          };

          this.logFailure(hostConfig.host, hostConfig.community, error);
        });
    });

    // Wait for all queries to complete
    await Promise.all(promises);

    this.logger.log(`SNMPv2 GET completed for ${dto.hosts.length} hosts`);
    return results;
  }

  private queryHost(host: string,port: number,community: string,oids: string[],) {
    return new Promise((resolve, reject) => {
      const session = this.createV2cSession(host, port, community);

      const start = Date.now();

      session.get(oids, (err, varbinds) => {
        const responseTimeMs = Date.now() - start;

        session.close();

        if (err) {
          return reject({
            reachable: false,
            responseTimeMs,
            error: err.message,
          });
        }

        resolve({
          reachable: true,
          responseTimeMs,
          data: varbinds.map((vb) => ({
            oid: vb.oid,
            value: vb.value?.toString(),
          })),
        });
      });
    });
  }

  async getSnmpV3(dto: SnmpV3GetDto) {
    return new Promise((resolve, reject) => {
      const session = this.createV3Session(dto);

      session.get(dto.oids, (err, varbinds) => {
        session.close();

        if (err) {
          return reject(new InternalServerErrorException(err.message));
        }

        const result = varbinds.map((vb) => ({
          oid: vb.oid,
          value: vb.value?.toString(),
        }));

        this.logger.log(`SNMPv3 GET successful: ${JSON.stringify(result)}`);

        resolve(result);
      });
    });
  }

  private async logSuccess(ip: string, communityString: string, result:any) {
    try {
      await this.snmpSuccessModel.create({
        ip,
        communityString,
        status: 'success',
        responseTimeMs: result.responseTimeMs,
        data: result.data || result.varbinds,
      });
    } catch (error) {
      this.logger.error(`Failed to log success: ${error.message}`);
    }
  }

  private async logFailure(ip: string, communityString: string, error:any) {
    try {
      await this.snmpFailModel.create({
        ip,
        communityString,
        status: 'fail',
        responseTimeMs: error.responseTimeMs,
        remark: error.error || error.message,
        error,
      });
    } catch (dbError) {
      this.logger.error(`Failed to log failure: ${dbError.message}`);
    }
  }
}
