import { TsunamiLogWithinInternalTransaction } from './tsunami-log-within-internal-transaction';
import { TsunamiBasicLogData } from './tsunami-basic-log-data';

export interface TsunamiInternalTransactionBase extends TsunamiBasicLogData {
  value: string;
  sender: string;
}

export interface TsunamiInternalTransaction extends TsunamiInternalTransactionBase {
  sig_hash: string;
  input_data: string;
  events?: readonly TsunamiLogWithinInternalTransaction[];
}
