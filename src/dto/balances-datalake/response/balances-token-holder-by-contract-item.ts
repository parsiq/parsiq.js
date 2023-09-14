import { BalancesBasicHolderItem } from './balances-basic-holder-item';

export interface BalancesTokenHolderByContractItem extends BalancesBasicHolderItem {
  address: string;
}
