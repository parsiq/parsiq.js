import { OpCode } from '../../../enum/op-code';

export interface TsunamiDecodedLog {
  id: string;
  op_code: OpCode;
  tx_hash: string;
  block_hash: string;
  block_number: number;
  timestamp: number;
  origin: string;
  contract: string;
  decoded: { event: string; [k: string]: any } | null;
  error?: string;
  topic_0?: string;
  topic_1?: string;
  topic_2?: string;
  topic_3?: string;
  log_data?: string;
}
