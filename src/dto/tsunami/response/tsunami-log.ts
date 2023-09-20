import { OpCode } from '../../../enum/op-code';

export interface TsunamiLog {
  op_code: OpCode;
  topic_0: string;
  topic_1: string;
  topic_2: string;
  topic_3: string;
  log_data: string;
  id: string;
  tx_hash: string;
  block_hash: string;
  block_number: number;
  timestamp: number;
  origin: string;
  contract: string;
}
