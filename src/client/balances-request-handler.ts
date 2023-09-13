import {HttpClient} from "./http-client";
import {AxiosRequestConfig} from "axios";
import {IAxiosRetryConfig} from "axios-retry";
import {
    FtTokenHolderByAddressItem,
    FtTokenHolderByContractItem, FtTokenInfoItemWithSupplies
} from "../dto/ft-datalake";
import {BALANCES_BASE_URL} from "./urls";
import {Parsiq} from "./parsiq-client";

const MALFORMED_RESPONSE_MESSAGE = 'Malformed NFT DL response';

export class BalancesRequestHandler extends HttpClient {
    constructor(
        apiKey: string,
        chain: Parsiq.ChainId,
        config: { axiosConfig?: AxiosRequestConfig; retryConfig?: IAxiosRetryConfig } = {
            axiosConfig: {},
            retryConfig: {},
        },
    ) {
        const {axiosConfig = {}, retryConfig = {}} = config;
        super(BALANCES_BASE_URL, chain, apiKey, axiosConfig, retryConfig);
    }

    public async *getByAddress(address: string): AsyncGenerator<FtTokenHolderByAddressItem, void, undefined> {
        const iterator = this.query<FtTokenHolderByAddressItem>(
            `/addresses/${address}/tokens`,
            {},
            {},
        );
        for await (const data of iterator) {
            yield *data;
        }
    }

    public async *getByContract(contract: string):AsyncGenerator<FtTokenHolderByContractItem, void, undefined> {
        const iterator = this.query<FtTokenHolderByContractItem>(
            `/tokens/${contract}/holders`,
            {},
            {},
        );
        for await (const data of iterator) {
            yield *data;
        }
    }

    public async getContractMetadata(contract: string): Promise<FtTokenInfoItemWithSupplies> {
        try {
            const response = await this.instance.get<FtTokenInfoItemWithSupplies>(`/tokens/${contract}`);
            if (!response?.data) {
                throw new Error(MALFORMED_RESPONSE_MESSAGE);
            }

            return response.data;
        } catch (error) {
            throw this.getRequestProcessingError(error)
        }
    }
}
