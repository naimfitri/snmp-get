import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type SnmpFailDoc = HydratedDocument<SnmpFail>;
export type SnmpSuccessDoc = HydratedDocument<SnmpSuccess>;

@Schema({ timestamps: true })
export class SnmpFail {
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
export class SnmpSuccess {
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

export const SnmpFailSchema = SchemaFactory.createForClass(SnmpFail);
export const SnmpSuccessSchema = SchemaFactory.createForClass(SnmpSuccess);