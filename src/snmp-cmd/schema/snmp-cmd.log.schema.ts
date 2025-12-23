import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type SnmpCmdFailDoc = HydratedDocument<SnmpCmdFail>;
export type SnmpCmdSuccessDoc = HydratedDocument<SnmpCmdSuccess>;

@Schema({ timestamps: true })
export class SnmpCmdFail {
  @Prop({ required: true })
  ip: string;

  @Prop({ required: true })
  communityString: string;

  @Prop({ default: 'fail' })
  status: string;

  @Prop()
  responseTimeMs: number;

  @Prop()
  remark: string;

  @Prop({ type: Object })
  error: any;

  @Prop({ default: Date.now })
  createdAt: Date;
}

@Schema({ timestamps: true })
export class SnmpCmdSuccess {
  @Prop({ required: true })
  ip: string;

  @Prop({ required: true })
  communityString: string;

  @Prop({ default: 'success' })
  status: string;

  @Prop()
  responseTimeMs: number;

  @Prop({ type: Array })
  data: any[];

  @Prop({ default: Date.now })
  createdAt: Date;
}

export const SnmpCmdFailSchema = SchemaFactory.createForClass(SnmpCmdFail);
export const SnmpCmdSuccessSchema = SchemaFactory.createForClass(SnmpCmdSuccess);
