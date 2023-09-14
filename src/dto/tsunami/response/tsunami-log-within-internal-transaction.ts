import { OpCode } from '../../../enum/op-code';

export interface TsunamiLogWithingInternalTransactionBase {
  topic_0?: string;
  topic_1?: string;
  topic_2?: string;
  topic_3?: string;
  log_data?: string;
  contract: string;
}

export interface TsunamiLogWithinInternalTransaction extends TsunamiLogWithingInternalTransactionBase {
  op_code: OpCode;
}
