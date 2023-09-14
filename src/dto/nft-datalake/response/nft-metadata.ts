import {NftTransferMetadata} from "./nft-transfer-metadata";
import {NftSalePriceData} from "./nft-sale-price-data";

export interface NftTokenBaseMetadata {
  token_uri?: string;
  content?: string | any;
  is_json?: boolean;
}

export interface NftContractMetadata {
  total_supply?: string;
  symbol?: string;
  name?: string;
  address: string;
  standard: string;
}

export interface NftTokenMetadata {
  token_id: string;
  collection: NftContractMetadata;
  metadata: NftTokenBaseMetadata | null;
  transfer: NftTransferMetadata;
  sale_price: NftSalePriceData | null;
}
