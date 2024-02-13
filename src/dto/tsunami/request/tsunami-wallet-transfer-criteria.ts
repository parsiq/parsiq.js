import { TsunamiTransfersCriteria } from './tsunami-transfers-criteria';

export interface TsunamiWalletTransferCriteria extends TsunamiTransfersCriteria {
  contract?: string[];
}
