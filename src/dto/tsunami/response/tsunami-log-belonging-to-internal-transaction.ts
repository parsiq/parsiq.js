import { OpCode } from '../../../enum/op-code';
export interface TsunamiLogBelongingToInternalTransaction {
  op_code: OpCode;
  topic_0: string;
  topic_1: string;
  topic_2: string;
  topic_3: string;
  log_data: string;
  contract: string;
}
