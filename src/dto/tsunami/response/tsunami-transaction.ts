import { TsunamiTransactionLog } from './tsunami-transaction-log';

export interface TsunamiTransaction {
  hash: string;
  block_hash?: string;
  block_number?: number;
  block_timestamp?: number;
  index?: number;
  gas_range?: number[];
  data?: object;
}

export interface TsunamiTransactionInternals extends TsunamiTransaction {
  logs?: readonly TsunamiTransactionLog[];
}
