import { OpCode } from '../../../enum/op-code';

export interface TsunamiLog {
  op_code: OpCode;
  topic_0: string;
  topic_1: string | null;
  topic_2: string | null;
  topic_3: string | null;
  log_data: string | null;
  id: string;
  tx_hash: string;
  block_hash: string;
  block_number: number;
  timestamp: number;
  origin: string;
  contract: string;
}
