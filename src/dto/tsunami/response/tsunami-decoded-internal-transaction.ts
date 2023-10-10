import { TsunamiDecodedLogBelongingToInternalTransaction } from './tsunami-decoded-log-belonging-to-internal-transaction';

export interface TsunamiDecodedInternalTransaction {
  id: string;
  tx_hash: string;
  block_hash: string;
  block_number: number;
  timestamp: number;
  origin: string;
  contract: string;
  value: string;
  sender: string;
  decoded: { function: string; [k: string]: any } | null;
  events?: readonly TsunamiDecodedLogBelongingToInternalTransaction[];
  sig_hash?: string;
  input_data?: string;
  error?: string;
}
