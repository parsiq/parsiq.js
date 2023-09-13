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
} from "../dto";
import {TsunamiError} from "./tsunami-error";
import {GetTsunamiTransfersQuery} from "../dto/get-tsunami-transfers-query";
import {GetWalletTransactionsQuery} from "../dto/get-wallet-transactions-query";
import {TSUNAMI_BASE_URL} from "./urls";
import {Parsiq} from "./parsiq-client";

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

    public async getBlockByNumber(blockNumber: number) {
        const block = this.getBlocks(blockNumber, blockNumber);

        return (await block.next()).value as TsunamiBlock;
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
    ): AsyncGenerator<TsunamiBlock, void, undefined> {
        const iterator = this.query<TsunamiBlock>(
            '/blocks',
            {},
            {
                timestamp_start: startBlockTimestamp,
                timestamp_end: endBlockTimestamp,
            },
        );
        for await (const blocks of iterator) {
            yield* blocks;
        }
    }

    public async *getBlocks(start: number, end: number) {
        const iterator = this.query<TsunamiBlock>(
            '/blocks',
            {},
            {
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

    public async *getEventsBatch(criteria: GetTsunamiEventQuery, boundaries: TsunamiDataQueryBoundaries) {
        yield* this.query<TsunamiEvent>('/events', criteria, boundaries);
    }

    public async *getEvents(criteria: GetTsunamiEventQuery, boundaries: TsunamiDataQueryBoundaries) {
        const stream = this.getEventsBatch(criteria, boundaries);

        for await (const events of stream) {
            yield* events;
        }
    }

    public async *getDecodedEvents(criteria: GetTsunamiEventQuery, boundaries: TsunamiDataQueryBoundaries, abi: any) {
        const stream = this.query<DecodedTsunamiEvent>('/decode/events', criteria, boundaries, abi);

        for await (const calls of stream) {
            yield* calls;
        }
    }

    public async *getCalls(criteria: GetTsunamiCallQuery, boundaries: TsunamiDataQueryBoundaries) {
        const stream = this.query<TsunamiCall>('/calls', criteria, boundaries);

        for await (const calls of stream) {
            yield* calls;
        }
    }

    public async *getDecodedCalls(criteria: GetTsunamiCallQuery, boundaries: TsunamiDataQueryBoundaries, abi: any) {
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

    async getTransactionWithLogs(transactionHash: string): Promise<TsunamiTransactionWithLogs> {
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

    async *getTransfers(
        address: string,
        criteria: GetTsunamiTransfersQuery,
        boundaries: TsunamiDataQueryBoundaries,
    ): AsyncGenerator<TsunamiTransfer, void, undefined> {
        const stream = this.query<TsunamiTransfer>(`/address/${address}/transfers`, criteria, boundaries);

        for await (const transfers of stream) {
            yield* transfers;
        }
    }

    async *getWalletTransactions(
        address: string,
        criteria: GetWalletTransactionsQuery,
        boundaries: TsunamiDataQueryBoundaries,
    ): AsyncGenerator<TsunamiTransaction | TsunamiTransactionWithLogs, void, undefined> {
        const stream = this.query<TsunamiTransaction>(`/address/${address}/txs`, criteria, boundaries);

        for await (const transactions of stream) {
            yield* transactions;
        }
    }

    async *getContractSelfDestructs(
        criteria: GetContractSelfDestructsQuery,
        boundaries: TsunamiDataQueryBoundaries,
    ): AsyncGenerator<TsunamiContractSelfDestruct, void, undefined> {
        const stream = this.query<TsunamiContractSelfDestruct>('/contracts/self-destructs', criteria, boundaries);

        for await (const selfDestruct of stream) {
            yield* selfDestruct;
        }
    }

    async *getContractCreates(
        criteria: GetContractCreateQuery,
        boundaries: TsunamiDataQueryBoundaries,
    ): AsyncGenerator<TsunamiContractSelfDestruct, void, undefined> {
        const stream = this.query<TsunamiContractCreate>('/contracts/creates', criteria, boundaries);

        for await (const create of stream) {
            yield* create;
        }
    }
}
