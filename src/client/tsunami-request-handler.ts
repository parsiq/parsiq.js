import {HttpClient} from "./http-client";
import {AxiosRequestConfig, HttpStatusCode, isAxiosError} from "axios";
import {IAxiosRetryConfig} from "axios-retry";
import {
    DecodedTsunamiEvent,
    GetContractCreateQuery,
    GetContractSelfDestructsQuery,
    GetTsunamiCallQuery,
    GetTsunamiEventQuery,
    TsunamiBlock,
    TsunamiCall,
    TsunamiContractCreate,
    TsunamiContractSelfDestruct,
    TsunamiDataQueryBoundaries,
    TsunamiEvent,
    TsunamiTransaction,
    TsunamiTransactionWithLogs,
    TsunamiTransfer,
    DecodedTsunamiCall
} from "../dto/tsunami";
import {TsunamiError} from "./tsunami-error";
import {GetTsunamiTransfersQuery} from "../dto/tsunami/get-tsunami-transfers-query";
import {GetWalletTransactionsQuery} from "../dto/tsunami/get-wallet-transactions-query";
import {TSUNAMI_BASE_URL} from "./urls";
import {Parsiq} from "./parsiq-client";
import {RangeOptions} from "../dto/common";

const MALFORMED_RESPONSE_MESSAGE = 'Malformed Tsunami response';
const REQUEST_FAILED_MESSAGE = 'Tsunami request failed';

export class TsunamiRequestHandler extends HttpClient {
    constructor(
        apiKey: string,
        chain: Parsiq.ChainId,
        config: { axiosConfig?: AxiosRequestConfig; retryConfig?: IAxiosRetryConfig } = {
            axiosConfig: {},
            retryConfig: {},
        },
    ) {
        const { axiosConfig = {}, retryConfig = {} } = config;
        super(TSUNAMI_BASE_URL, chain, apiKey, axiosConfig, retryConfig);
    }

    public async getBlockByHash(blockHash: string): Promise<TsunamiBlock> {
        try {
            const response = await this.instance.get<TsunamiBlock>(`/blocks/${blockHash}`);
            if (!response?.data) {
                throw new Error(MALFORMED_RESPONSE_MESSAGE);
            }

            return response.data;
        } catch (error) {
            if (isAxiosError(error)) {
                if (error.response?.status === HttpStatusCode.NotFound) {
                    throw new TsunamiError(
                        'Block not found',
                        error.response?.status ?? null,
                        error.response?.data?.error ?? null,
                    );
                }
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

    async *getBlocksByTimestamp(
        startBlockTimestamp: number,
        endBlockTimestamp: number,
        rangeOptions?: RangeOptions
    ): AsyncGenerator<TsunamiBlock, void, undefined> {
        const iterator = this.query<TsunamiBlock>(
            '/blocks',
            {},
            {
                ...rangeOptions,
                timestamp_start: startBlockTimestamp,
                timestamp_end: endBlockTimestamp,
            },
        );
        for await (const blocks of iterator) {
            yield* blocks;
        }
    }

    public async *getBlocksByNumber(start: number, end: number, rangeOptions?: RangeOptions) {
        const iterator = this.query<TsunamiBlock>(
            '/blocks',
            {},
            {
                ...rangeOptions,
                block_number_start: start,
                block_number_end: end,
            },
        );
        for await (const blocks of iterator) {
            yield* blocks;
        }
    }

    public async getLatestBlock(): Promise<TsunamiBlock> {
        try {
            const response = await this.instance.get<TsunamiBlock>('/blocks/latest');
            if (!response?.data) {
                throw new Error(MALFORMED_RESPONSE_MESSAGE);
            }
            return response.data;
        } catch (error) {
            throw this.getRequestProcessingError(error);
        }
    }

    public async *getLogs(criteria: GetTsunamiEventQuery, boundaries: TsunamiDataQueryBoundaries) {
        const stream = this.query<TsunamiEvent>('/events', criteria, boundaries);

        for await (const events of stream) {
            yield* events;
        }
    }

    public async *getDecodedLogs(criteria: GetTsunamiEventQuery, boundaries: TsunamiDataQueryBoundaries, abi: any) {
        const stream = this.query<DecodedTsunamiEvent>('/decode/events', criteria, boundaries, abi);

        for await (const calls of stream) {
            yield* calls;
        }
    }

    public async *getInternalTransactions(criteria: GetTsunamiCallQuery, boundaries: TsunamiDataQueryBoundaries) {
        const stream = this.query<TsunamiCall>('/calls', criteria, boundaries);

        for await (const calls of stream) {
            yield* calls;
        }
    }

    public async *getDecodedInternalTransactions(criteria: GetTsunamiCallQuery, boundaries: TsunamiDataQueryBoundaries, abi: any) {
        const stream = this.query<DecodedTsunamiCall>('/decode/calls', criteria, boundaries, abi);

        for await (const calls of stream) {
            yield* calls;
        }
    }

    async getTransaction(transactionHash: string): Promise<TsunamiTransaction> {
        try {
            const response = await this.instance.get<TsunamiTransaction>(`/txs/${transactionHash}`);
            if (!response?.data) {
                throw new Error(MALFORMED_RESPONSE_MESSAGE);
            }

            return response.data;
        } catch (error) {
            if (isAxiosError(error)) {
                if (error.response?.status === HttpStatusCode.NotFound) {
                    throw new TsunamiError(
                        'Transaction not found',
                        error.response?.status ?? null,
                        error.response?.data?.error ?? null,
                    );
                }
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

    async getTransactionInternals(transactionHash: string): Promise<TsunamiTransactionWithLogs> {
        try {
            const response = await this.instance.get<TsunamiTransaction>(`/txs/${transactionHash}/logs`);
            if (!response?.data) {
                throw new Error(MALFORMED_RESPONSE_MESSAGE);
            }

            return response.data;
        } catch (error) {
            if (isAxiosError(error)) {
                if (error.response?.status === HttpStatusCode.NotFound) {
                    throw new TsunamiError(
                        'Transaction not found',
                        error.response?.status ?? null,
                        error.response?.data?.error ?? null,
                    );
                }
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

    async *getContractTransfers(
        contract: string,
        criteria: GetTsunamiTransfersQuery,
        boundaries: TsunamiDataQueryBoundaries,
    ): AsyncGenerator<TsunamiTransfer, void, undefined> {
        const stream = this.query<TsunamiTransfer>(`/contract/${contract}/transfers`, criteria, boundaries);

        for await (const transfers of stream) {
            yield* transfers;
        }
    }

    async *getWalletTransfers(
        address: string,
        criteria: GetTsunamiTransfersQuery,
        boundaries: TsunamiDataQueryBoundaries,
    ): AsyncGenerator<TsunamiTransfer, void, undefined> {
        const stream = this.query<TsunamiTransfer>(`/address/${address}/transfers`, criteria, boundaries);

        for await (const transfers of stream) {
            yield* transfers;
        }
    }

    async *getTransactions(
        address: string,
        criteria: GetWalletTransactionsQuery,
        boundaries: TsunamiDataQueryBoundaries,
    ): AsyncGenerator<TsunamiTransaction | TsunamiTransactionWithLogs, void, undefined> {
        const stream = this.query<TsunamiTransaction>(`/address/${address}/txs`, criteria, boundaries);

        for await (const transactions of stream) {
            yield* transactions;
        }
    }

    async *getContractSelfDestructions(
        criteria: GetContractSelfDestructsQuery,
        boundaries: TsunamiDataQueryBoundaries,
    ): AsyncGenerator<TsunamiContractSelfDestruct, void, undefined> {
        const stream = this.query<TsunamiContractSelfDestruct>('/contracts/self-destructs', criteria, boundaries);

        for await (const selfDestruct of stream) {
            yield* selfDestruct;
        }
    }

    async *getContractCreations(
        criteria: GetContractCreateQuery,
        boundaries: TsunamiDataQueryBoundaries,
    ): AsyncGenerator<TsunamiContractSelfDestruct, void, undefined> {
        const stream = this.query<TsunamiContractCreate>('/contracts/creates', criteria, boundaries);

        for await (const create of stream) {
            yield* create;
        }
    }
}
