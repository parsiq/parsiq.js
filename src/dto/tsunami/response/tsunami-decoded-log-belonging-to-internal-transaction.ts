import { OpCode } from '../../../enum/op-code';

export interface TsunamiDecodedLogBelongingToInternalTransaction {
  op_code: OpCode;
  contract: string;
  decoded: { event: string; [k: string]: any } | null;
  topic_0: string;
  topic_1: string | null;
  topic_2: string | null;
  topic_3: string | null;
  log_data: string | null;
  error?: string;
}
