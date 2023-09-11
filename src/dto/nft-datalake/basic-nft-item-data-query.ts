import {AdditionalNftDataQuery} from "./additional-nft-data-query";

export interface BasicNftItemDataQuery extends AdditionalNftDataQuery{
    contract?: string;
}
