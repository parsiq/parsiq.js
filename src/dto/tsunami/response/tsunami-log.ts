import { OpCode } from '../../../enum/op-code';
import { TsunamiBasicLogData } from './tsunami-basic-log-data';

export interface TsunamiLogBase extends TsunamiBasicLogData {
  topic_0?: string;
  topic_1?: string;
  topic_2?: string;
  topic_3?: string;
  log_data?: string;
}

export interface TsunamiLog extends TsunamiLogBase {
  op_code: OpCode;
}
