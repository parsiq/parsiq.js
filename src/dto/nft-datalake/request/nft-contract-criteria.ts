import {NftSupplementalDataCriteria} from "./nft-supplemental-data-criteria";

export interface NftContractCriteria extends NftSupplementalDataCriteria{
    contract?: string;
}
