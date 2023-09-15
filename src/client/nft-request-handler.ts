import {HttpClient} from "./http-client";
import {AxiosRequestConfig} from "axios";
import {IAxiosRetryConfig} from "axios-retry";
import {
    NftAddressInventoryHistoryItem,
    NftAddressInventoryItem,
    NftSupplementalDataCriteria,
    NftContractCriteria,
    NftTokenTransferItem,
    NftCollectionTokenHolder,
    NftCollectionMetadata, NftTokenMetadata
} from "../dto/nft-datalake";
import {NFT_BASE_URL} from "./urls";
import {Parsiq} from "./parsiq-client";
import {RangeOptions} from "../dto/common";

const MALFORMED_RESPONSE_MESSAGE = 'Malformed NFT DL response';

export class NftRequestHandler extends HttpClient {
    constructor(
        apiKey: string,
        chain: Parsiq.ChainId,
        config: { axiosConfig?: AxiosRequestConfig; retryConfig?: IAxiosRetryConfig } = {
            axiosConfig: {},
            retryConfig: {},
        },
    ) {
        const {axiosConfig = {}, retryConfig = {}} = config;
        super(NFT_BASE_URL, chain, apiKey, axiosConfig, retryConfig);
    }

    public async *getNftByAddress(address: string, criteria: NftContractCriteria, boundaries: RangeOptions): AsyncGenerator<NftAddressInventoryItem, void, undefined> {
        const iterator = this.query<NftAddressInventoryItem>(
            `/${address}/inventory`,
            criteria,
            boundaries,
        );
        for await (const data of iterator) {
            yield* data;
        }
    }

    public async *getNftHistoryByAddress(address: string, criteria: NftContractCriteria, boundaries: RangeOptions): AsyncGenerator<NftAddressInventoryHistoryItem, void, undefined> {
        const iterator = this.query<NftAddressInventoryHistoryItem>(
            `/${address}/history`,
            criteria,
            boundaries,
        );
        for await (const data of iterator) {
            yield *data;
        }
    }

    public async *getNftHistory(tokenId: string, contract: string, criteria: NftSupplementalDataCriteria, boundaries: RangeOptions): AsyncGenerator<NftCollectionTokenHolder, void, undefined> {
        const iterator = this.query<NftCollectionTokenHolder>(
            `/${contract}/${tokenId}/history`,
            criteria,
            boundaries,
        );
        for await (const data of iterator) {
            yield *data;
        }
    }

    public async *getCollectionHolders(contract: string, criteria: NftSupplementalDataCriteria, boundaries: RangeOptions): AsyncGenerator<NftTokenTransferItem, void, undefined> {
        const iterator = this.query<NftTokenTransferItem>(
            `/${contract}/owner`,
            criteria,
            boundaries,
        );
        for await (const data of iterator) {
            yield *data;
        }
    }

    public async getNftMetadata(tokenId: string, contract: string): Promise<NftTokenMetadata> {
        try {
            const response = await this.instance.get<NftTokenMetadata>(`/${contract}/${tokenId}/metadata`);
            if (!response?.data) {
                throw new Error(MALFORMED_RESPONSE_MESSAGE);
            }

            return response.data;
        } catch (error) {
            throw this.getRequestProcessingError(error);
        }
    }

    public async getCollectionMetadata(contract: string): Promise<NftCollectionMetadata> {
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
