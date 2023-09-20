import { TsunamiLogBelongingToInternalTransaction } from './tsunami-log-belonging-to-internal-transaction';

export interface TsunamiInternalTransaction {
  id: string;
  tx_hash: string;
  block_hash: string;
  block_number: number;
  timestamp: number;
  origin: string;
  contract: string;
  sig_hash: string;
  input_data: string;
  events?: readonly TsunamiLogBelongingToInternalTransaction[];
  value: string;
  sender: string;
}
