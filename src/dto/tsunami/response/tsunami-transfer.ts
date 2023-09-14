import { AssetType } from '../../../enum/asset-type';
import { TsunamiBasicLogData } from './tsunami-basic-log-data';

export interface TsunamiTransfer extends TsunamiBasicLogData {
  sender: string;

  recipient: string;

  value: string | string[] | null;

  token_id: string | string[] | null;

  asset_type: AssetType;
}
