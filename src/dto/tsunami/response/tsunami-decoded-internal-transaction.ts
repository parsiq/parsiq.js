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
  decoded: { function: string; [k: string]: any };
  events?: readonly TsunamiDecodedLogBelongingToInternalTransaction[];
}

export interface TsunamiDecodingErrorInternalTransaction {
  id: string;
  tx_hash: string;
  block_hash: string;
  block_number: number;
  timestamp: number;
  origin: string;
  contract: string;
  sig_hash: string;
  input_data: string;
  value: string;
  sender: string;
  events?: readonly TsunamiDecodedLogBelongingToInternalTransaction[];
  error: string;
  decoded: null; //TODO: it confirms to what we do in Tsunami, but it is really useless
}
