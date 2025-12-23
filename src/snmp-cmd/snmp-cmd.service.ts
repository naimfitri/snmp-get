import { Injectable, Logger } from '@nestjs/common';
import { exec } from 'child_process';
import { SnmpRequestDto } from './dto/snmp.request.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { SnmpCmdFail, SnmpCmdSuccess } from './schema/snmp-cmd.log.schema';

@Injectable()
export class SnmpCmdService {

    private readonly logger = new Logger(SnmpCmdService.name);

    constructor(
        @InjectModel(SnmpCmdFail.name) private snmpCmdFailModel: Model<SnmpCmdFail>,
        @InjectModel(SnmpCmdSuccess.name) private snmpCmdSuccessModel: Model<SnmpCmdSuccess>,
    ) {}
    
    async getSnmpData(dto: SnmpRequestDto): Promise<{ [key: string]: any }> {
        const { ip, community, oids } = dto;
        const startTime = Date.now();

        this.logger.log(`Starting SNMP query for ${ip} with community '${community}' for ${oids.length} OID(s)`);

        try {
            const dataArray: Array<{ oid: string; value?: string; error?: string }> = [];
            let reachable = true;

            for (const oid of oids) {
                try {
                    this.logger.debug(`Querying OID: ${oid}`);
                    const value = await this.queryOid(ip, community, oid);
                    dataArray.push({
                        oid,
                        value,
                    });
                    this.logger.debug(`Successfully retrieved value for OID ${oid}: ${value}`);
                } catch (error) {
                    reachable = false;
                    this.logger.error(`Failed to query OID ${oid}: ${error.message}`);
                    dataArray.push({
                        oid,
                        error: error.message,
                    });
                }
            }

            const responseTimeMs = Date.now() - startTime;
            const key = `${ip}:${community}`;

            this.logger.log(`Completed SNMP query for ${ip} - Reachable: ${reachable}, Response time: ${responseTimeMs}ms`);

            // Log to MongoDB
            if (reachable) {
                await this.logSuccess(ip, community, responseTimeMs, dataArray);
            } else {
                await this.logFailure(ip, community, responseTimeMs, dataArray);
            }

            return {
                [key]: {
                    community,
                    data: {
                        reachable,
                        responseTimeMs,
                        data: dataArray,
                    },
                },
            };
        } catch (error) {
            this.logger.error(`Failed to retrieve SNMP data from ${ip}: ${error.message}`);
            throw new Error(`Failed to retrieve SNMP data: ${error.message}`);
        }
    }

    private queryOid(ip: string, community: string, oid: string): Promise<string> {
        return new Promise((resolve, reject) => {
            const cmd = `snmpget -v2c -c ${community} ${ip} ${oid}`;
            this.logger.debug(`Executing command: ${cmd}`);
            exec(cmd, (error, stdout, stderr) => {
                if (error) {
                    this.logger.warn(`Command error for ${oid}: ${error.message}`);
                    reject(new Error(`${error.message}`));
                } else if (stderr) {
                    this.logger.warn(`Command stderr for ${oid}: ${stderr}`);
                    reject(new Error(`${stderr}`));
                } else {
                    const value = stdout.split('=')[1]?.trim() || stdout.trim();
                    resolve(value);
                }
            });
        });
    }

    private async logSuccess(ip: string, communityString: string, responseTimeMs: number, data: any[]) {
        try {
            await this.snmpCmdSuccessModel.create({
                ip,
                communityString,
                status: 'success',
                responseTimeMs,
                data,
            });
        } catch (error) {
            this.logger.error(`Failed to log success: ${error.message}`);
        }
    }

    private async logFailure(ip: string, communityString: string, responseTimeMs: number, data: any[]) {
        try {
            const errorMessages = data
                .filter(item => item.error)
                .map(item => `${item.oid}: ${item.error}`)
                .join('; ');

            await this.snmpCmdFailModel.create({
                ip,
                communityString,
                status: 'fail',
                responseTimeMs,
                remark: errorMessages || 'SNMP query failed',
                error: data,
            });
        } catch (dbError) {
            this.logger.error(`Failed to log failure: ${dbError.message}`);
        }
    }
}
