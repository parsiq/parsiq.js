import { BasicTsunamiDataCriteria } from './basic-tsunami-data-criteria';

export interface TsunamiInternalTransactionsCriteria extends BasicTsunamiDataCriteria {
  sender?: string[];
  sig_hash?: string[];
  include_events?: boolean;
}
