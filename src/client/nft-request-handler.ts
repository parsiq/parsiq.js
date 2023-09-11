import {HttpClient} from "./http-client";
import {ChainId} from "../enum/chain-id";
import {AxiosRequestConfig, isAxiosError} from "axios";
import {IAxiosRetryConfig} from "axios-retry";
import {convertForRequest} from "./convertor";
import {TsunamiError} from "./tsunami-error";
import {NftAddressInventoryItem, NftRangeResponse} from "../dto/nft-datalake";
import {NftDataQueryBoundaries} from "../dto/nft-datalake/nft-data-query-boundaries";

const MALFORMED_RESPONSE_MESSAGE = 'Malformed NFT DL response';
const REQUEST_FAILED_MESSAGE = 'NFT DL request failed';

const baseUrl = (chain: ChainId) => {
    if (!Object.values(ChainId).includes(chain)) {
        throw new Error('Invalid chain provided');
    }
    return NFT_BASE_URL + `${chain}/v1/`;
};

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
        super(baseUrl(chain), apiKey, axiosConfig, retryConfig);
    }

    public setChain(chain: ChainId) {
        this.instance.defaults.baseURL = baseUrl(chain);
    }

    public async *getAddressNFTs(address: string, boundaries: NftDataQueryBoundaries): AsyncGenerator<NftAddressInventoryItem, void, undefined> {
        const iterator = this.queryNftDl<NftAddressInventoryItem>(
            `/${address}/inventory`,
            {},
            boundaries,
        );
        for await (const blocks of iterator) {
            yield* blocks;
        }
    }

    protected async *queryNftDl<
        Item extends NftAddressInventoryItem = any,
    >(
        endpoint: string,
        criteria: Record<string, any>,
        boundaries: NftDataQueryBoundaries
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
        Item extends NftAddressInventoryItem = any,
    >(endpoint: string, params: Record<string, string | number>) {
        const response = await this.instance
            .get<{ range: NftRangeResponse; items: Item[] }>(endpoint, {
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
