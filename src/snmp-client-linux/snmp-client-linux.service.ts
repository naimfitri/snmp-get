import { Injectable } from '@nestjs/common';
import * as snmp from 'net-snmp';
import { SnmpLinuxGetDto, SnmpVersion } from './dto/snmplinux.get.dto';

@Injectable()
export class SnmpClientLinuxService {
    async get(dto: SnmpLinuxGetDto): Promise<any> {
        return new Promise((resolve, reject) => {
            let session;

            if (dto.version === SnmpVersion.V2C) {
                const community = dto.community || 'public';
                session = snmp.createSession(dto.host, community);
            } else if (dto.version === SnmpVersion.V3) {
                if (!dto.user || !dto.authPass || !dto.privPass) {
                    return reject(new Error('Missing V3 credentials'));
                }

                const options: snmp.Options = {
                    version: snmp.Version3,
                };
                console.log(`options: ${JSON.stringify(options)}`);

                const user = {
                    name: dto.user,
                    level: snmp.SecurityLevel.authPriv,
                    authProtocol: snmp.PrivProtocols.md5,
                    authKey: dto.authPass,
                    privProtocol: snmp.PrivProtocols.aes,
                    privKey: dto.privPass,
                };
                console.log(`user: ${JSON.stringify(user)}`);

                session = snmp.createV3Session(dto.host, user, options);
            }

            session.get([dto.oid], (err, varbinds) => {
                session.close();
                if (err) return reject(err);
                resolve(varbinds[0].value.toString());
            });
        });
    }
}
