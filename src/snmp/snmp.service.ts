import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import * as snmp from 'net-snmp';
import { SnmpV3GetDto, AuthProtocol, PrivProtocol } from './dto/snmpV3.get.dto';
import { SnmpGetDto, HostConfig } from './dto/snmp.get.dto';

@Injectable()
export class SnmpService {
  private readonly logger = new Logger(SnmpService.name);

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
        })
        .catch((error) => {
          results[key] = {
            community: hostConfig.community,
            error: error.message,
          };
        });
    });

    // Wait for all queries to complete
    await Promise.all(promises);

    this.logger.log(`SNMPv2 GET completed for ${dto.hosts.length} hosts`);
    return results;
  }

  private queryHost(
    host: string,
    port: number,
    community: string,
    oids: string[],
  ) {
    return new Promise((resolve, reject) => {
      const session = this.createV2cSession(host, port, community);

      session.get(oids, (err, varbinds) => {
        session.close();

        if (err) {
          return reject(new InternalServerErrorException(err.message));
        }

        const result = varbinds.map((vb) => ({
          oid: vb.oid,
          value: vb.value?.toString(),
        }));

        resolve(result);
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
}
