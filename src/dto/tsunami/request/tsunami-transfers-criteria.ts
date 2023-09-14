import { TransferDirection } from '../../../enum/transfer-direction';
import { AssetType } from '../../../enum/asset-type';

export interface TsunamiTransfersCriteria {
  asset_type: AssetType[];

  direction?: TransferDirection;

  counterparty?: string;
}
