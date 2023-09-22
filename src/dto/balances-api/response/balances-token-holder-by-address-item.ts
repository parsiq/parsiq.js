import { BalancesBasicTokenInfoItem } from './balances-basic-token-info-item';
import { BalancesBasicHolderItem } from './balances-basic-holder-item';

export interface BalancesTokenHolderByAddressItem extends BalancesBasicHolderItem {
  token: BalancesBasicTokenInfoItem;
}
