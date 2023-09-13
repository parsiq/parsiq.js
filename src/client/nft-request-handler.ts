import {HttpClient} from "./http-client";
import {ChainId} from "../enum/chain-id";
import {AxiosRequestConfig} from "axios";
import {IAxiosRetryConfig} from "axios-retry";
import {
    NftAddressInventoryHistoryItem,
    NftAddressInventoryItem,
    AdditionalNftDataQuery,
    BasicNftItemDataQuery,
    NftTokenTransferItem,
    NftCollectionTokenHolder,
    NftHistoryItem,
    NftCollectionMetadata
} from "../dto/nft-datalake";
import {NftDataQueryBoundaries} from "../dto/nft-datalake";
import {NFT_BASE_URL} from "./urls";

const MALFORMED_RESPONSE_MESSAGE = 'Malformed NFT DL response';

export class NftRequestHandler extends HttpClient {
    constructor(
        apiKey: string,
        chain: ChainId,
        config: { axiosConfig?: AxiosRequestConfig; retryConfig?: IAxiosRetryConfig } = {
            axiosConfig: {},
            retryConfig: {},
        },
    ) {
        const {axiosConfig = {}, retryConfig = {}} = config;
        super(NFT_BASE_URL, chain, apiKey, axiosConfig, retryConfig);
    }

    public async *getAddressNFTs(address: string, criteria: BasicNftItemDataQuery, boundaries: NftDataQueryBoundaries): AsyncGenerator<NftAddressInventoryItem, void, undefined> {
        const iterator = this.query<NftAddressInventoryItem>(
            `/${address}/inventory`,
            criteria,
            boundaries,
        );
        for await (const data of iterator) {
            yield* data;
        }
    }

    public async *getAddressHistory(address: string, criteria: BasicNftItemDataQuery, boundaries: NftDataQueryBoundaries): AsyncGenerator<NftAddressInventoryHistoryItem, void, undefined> {
        const iterator = this.query<NftAddressInventoryHistoryItem>(
            `/${address}/history`,
            criteria,
            boundaries,
        );
        for await (const data of iterator) {
            yield *data;
        }
    }

    public async *getTokenHistory(tokenId: string, contract: string, criteria: AdditionalNftDataQuery, boundaries: NftDataQueryBoundaries): AsyncGenerator<NftCollectionTokenHolder, void, undefined> {
        const iterator = this.query<NftCollectionTokenHolder>(
            `/${contract}/${tokenId}/history`,
            criteria,
            boundaries,
        );
        for await (const data of iterator) {
            yield *data;
        }
    }

    public async *getCollectionHolders(contract: string, criteria: AdditionalNftDataQuery, boundaries: NftDataQueryBoundaries): AsyncGenerator<NftTokenTransferItem, void, undefined> {
        const iterator = this.query<NftTokenTransferItem>(
            `/${contract}/owner`,
            criteria,
            boundaries,
        );
        for await (const data of iterator) {
            yield *data;
        }
    }

    public async getTokenMetadata(tokenId: string, contract: string): Promise<Omit<NftHistoryItem, 'id'>> {
        try {
            const response = await this.instance.get<Omit<NftHistoryItem, 'id'>>(`/${contract}/${tokenId}/metadata`);
            if (!response?.data) {
                throw new Error(MALFORMED_RESPONSE_MESSAGE);
            }

            return response.data;
        } catch (error) {
            throw this.getRequestProcessingError(error);
        }
    }

    public async getContractMetadata(contract: string): Promise<NftCollectionMetadata> {
        try {
            const response = await this.instance.get<NftCollectionMetadata>(`/${contract}/contract-data`);
            if (!response?.data) {
                throw new Error(MALFORMED_RESPONSE_MESSAGE);
            }

            return response.data;
        } catch (error) {
            throw this.getRequestProcessingError(error);
        }
    }
}
