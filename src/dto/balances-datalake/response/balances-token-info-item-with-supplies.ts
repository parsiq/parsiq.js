import { BalancesBasicTokenInfoItem } from './balances-basic-token-info-item';

export interface BalancesTokenInfoItemWithSupplies extends BalancesBasicTokenInfoItem {
  total_supply_raw: string | null;
  total_supply_calculated: string | null;
}
