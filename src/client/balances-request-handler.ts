import {HttpClient} from "./http-client";
import {ChainId} from "../enum/chain-id";
import {AxiosRequestConfig, isAxiosError} from "axios";
import {IAxiosRetryConfig} from "axios-retry";
import {convertForRequest} from "./convertor";
import {TsunamiError} from "./tsunami-error";
import {
    FtTokenHolderByAddressItem,
    BalancesDataQueryBoundaries,
    BalancesRangeResponse,
    FtTokenHolderByContractItem, FtTokenInfoItemWithSupplies
} from "../dto/ft-datalake";
import {BALANCES_BASE_URL} from "./urls";

const MALFORMED_RESPONSE_MESSAGE = 'Malformed NFT DL response';
const REQUEST_FAILED_MESSAGE = 'NFT DL request failed';

const baseUrl = (chain: ChainId) => {
    if (!Object.values(ChainId).includes(chain)) {
        throw new Error('Invalid chain provided');
    }
    return BALANCES_BASE_URL + `${chain}/v1/`;
};

export class BalancesRequestHandler extends HttpClient {
    constructor(
        apiKey: string,
        chain: ChainId,
        config: { axiosConfig?: AxiosRequestConfig; retryConfig?: IAxiosRetryConfig } = {
            axiosConfig: {},
            retryConfig: {},
        },
    ) {
        const {axiosConfig = {}, retryConfig = {}} = config;
        super(baseUrl(chain), apiKey, axiosConfig, retryConfig);
    }

    public setChain(chain: ChainId) {
        this.instance.defaults.baseURL = baseUrl(chain);
    }

    public async *getByAddress(address: string): AsyncGenerator<FtTokenHolderByAddressItem, void, undefined> {
        const iterator = this.queryBalancesDl<FtTokenHolderByAddressItem>(
            `/addresses/${address}/tokens`,
            {},
            {},
        );
        for await (const data of iterator) {
            yield *data;
        }
    }

    public async *getByContract(contract: string):AsyncGenerator<FtTokenHolderByContractItem, void, undefined> {
        const iterator = this.queryBalancesDl<FtTokenHolderByContractItem>(
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
            if (isAxiosError(error)) {
                throw new TsunamiError(
                    error.response?.data?.message ?? REQUEST_FAILED_MESSAGE,
                    error.response?.status ?? null,
                    error.response?.data?.error ?? null,
                    error.cause ?? null,
                );
            }
            throw new TsunamiError(REQUEST_FAILED_MESSAGE, null, null, error);
        }
    }

    protected async *queryBalancesDl<
        Item extends FtTokenHolderByAddressItem | FtTokenHolderByContractItem = any,
    >(
        endpoint: string,
        criteria: Record<string, any>,
        boundaries: BalancesDataQueryBoundaries
    ): AsyncGenerator<Item[]> {
        let offset: string | undefined;
        let hasMore;
        const hardLimit = boundaries.limit ?? Infinity;
        let fetched = 0;
        do {
            const params = {
                ...boundaries,
                ...convertForRequest(criteria),
                ...(offset ? {offset} : {}),
                limit: Math.min(boundaries.batchSize ?? 1000, boundaries.limit ?? 1000, 1000),
            };

            const response = await this.doRequest<Item>(endpoint, params);

            if (response.data.items.length > hardLimit - fetched) {
                yield response.data.items.splice(0, hardLimit - fetched);
                return;
            }

            yield response.data.items;
            fetched += response.data.items.length;

            hasMore = response.data.range.has_more;
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            offset = response.data.range.next_offset!;
        } while (hasMore && fetched < hardLimit);
    }

    protected async doRequest<
        Item extends FtTokenHolderByAddressItem | FtTokenHolderByContractItem = any,
    >(endpoint: string, params: Record<string, string | number>) {
        const response = await this.instance
            .get<{ range: BalancesRangeResponse; items: Item[] }>(endpoint, {
                params,
            })
            .catch(error => {
                if (isAxiosError(error)) {
                    throw new TsunamiError(
                        error.response?.data?.message ?? REQUEST_FAILED_MESSAGE,
                        error.response?.status ?? null,
                        error.response?.data?.error ?? null,
                        error.cause ?? null,
                    );
                }
                throw new TsunamiError(REQUEST_FAILED_MESSAGE, null, null, error);
            });

        if (!response?.data?.items) {
            throw new TsunamiError(MALFORMED_RESPONSE_MESSAGE, null, null);
        }

        return response;
    }
}
