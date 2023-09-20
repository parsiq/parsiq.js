import { AssetType } from '../../../enum/asset-type';

export interface TsunamiTransfer {
  id: string;
  sender: string;
  recipient: string;
  value: string | string[] | null;
  token_id: string | string[] | null;
  asset_type: AssetType;
  tx_hash: string;
  block_hash: string;
  block_number: number;
  timestamp: number;
  origin: string;
  contract: string;
}
