import { NftContractMetadata, NftTokenBaseMetadata } from './nft-metadata';
import { NftInventoryTransferMetadata } from './nft-transfer-metadata';
import { NftSalePriceData } from './nft-sale-price-data';

export interface NftAddressInventoryItem {
  id: string;
  collection: NftContractMetadata;
  token_id: string;
  transfer: NftInventoryTransferMetadata;
  metadata: NftTokenBaseMetadata | null;
  sale_price: NftSalePriceData | null;
}
