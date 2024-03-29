import { HttpClient } from './http-client';
import { AxiosRequestConfig, AxiosResponse, HttpStatusCode, isAxiosError } from 'axios';
import { IAxiosRetryConfig } from 'axios-retry';
import {
  TsunamiContractCreationCriteria,
  ContractSelfDestructionsCriteria,
  TsunamiInternalTransactionsCriteria,
  TsunamiLogsCriteria,
  TsunamiBlock,
  TsunamiInternalTransaction,
  TsunamiContractCreation,
  TsunamiContractSelfDestruction,
  TsunamiDataRangeOptions,
  TsunamiLog,
  TsunamiTransaction,
  TsunamiTransfer,
  TsunamiAbi,
  TsunamiTransactionInternalsCriteria,
  TsunamiStreamRangeOptions,
  TsunamiWalletTransferCriteria,
} from '../dto/tsunami';
import { TsunamiError } from './tsunami-error';
import { TsunamiTransfersCriteria } from '../dto/tsunami/request/tsunami-transfers-criteria';
import { TsunamiTransactionsCriteria } from '../dto/tsunami/request/tsunami-transactions-criteria';
import { TSUNAMI_BASE_URL } from './urls';
import * as Parsiq from './parsiq-client';
import { RangeOptions } from '../dto/common';
import { decodeTsunamiInternalTransaction, decodeTsunamiLog } from '../decode/utils';
import { LATEST_TAG } from '../constants';
import { convertForRequest } from './convertor';
import { Readable } from 'stream';

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
    rangeOptions?: RangeOptions,
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

  public async *getBlocksByNumber(start: number, end: number | typeof LATEST_TAG, rangeOptions?: RangeOptions) {
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

  public async *getLogs(criteria: TsunamiLogsCriteria, rangeOptions: TsunamiDataRangeOptions) {
    const stream = this.query<TsunamiLog>('/events', criteria, rangeOptions);

    for await (const events of stream) {
      yield* events;
    }
  }

  public async *getDecodedLogs(criteria: TsunamiLogsCriteria, rangeOptions: TsunamiDataRangeOptions, abi: TsunamiAbi) {
    for await (const log of this.getLogs(criteria, rangeOptions)) {
      yield decodeTsunamiLog(log, abi);
    }
  }

  public async *getInternalTransactions(
    criteria: TsunamiInternalTransactionsCriteria,
    rangeOptions: TsunamiDataRangeOptions,
  ) {
    const stream = this.query<TsunamiInternalTransaction>('/calls', criteria, rangeOptions);

    for await (const calls of stream) {
      yield* calls;
    }
  }

  public async *getDecodedInternalTransactions(
    criteria: TsunamiInternalTransactionsCriteria,
    rangeOptions: TsunamiDataRangeOptions,
    abi: TsunamiAbi,
  ) {
    for await (const internalTransaction of this.getInternalTransactions(criteria, rangeOptions)) {
      yield decodeTsunamiInternalTransaction(internalTransaction, abi);
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

  async getTransactionInternals(
    transactionHash: string,
    criteria?: TsunamiTransactionInternalsCriteria,
  ): Promise<TsunamiTransaction> {
    try {
      const params = criteria
        ? {
            ...convertForRequest(criteria),
          }
        : {};
      const response = await this.instance.get<TsunamiTransaction>(`/txs/${transactionHash}/logs`, { params });
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

  async *getTokenTransfers(
    contract: string,
    criteria: TsunamiTransfersCriteria,
    rangeOptions: TsunamiDataRangeOptions,
  ): AsyncGenerator<TsunamiTransfer, void, undefined> {
    const stream = this.query<TsunamiTransfer>(`/contract/${contract}/transfers`, criteria, rangeOptions);

    for await (const transfers of stream) {
      yield* transfers;
    }
  }

  async *getWalletTransfers(
    address: string,
    criteria: TsunamiWalletTransferCriteria,
    rangeOptions: TsunamiDataRangeOptions,
  ): AsyncGenerator<TsunamiTransfer, void, undefined> {
    const stream = this.query<TsunamiTransfer>(`/address/${address}/transfers`, criteria, rangeOptions);

    for await (const transfers of stream) {
      yield* transfers;
    }
  }

  async *getTransactions(
    address: string,
    criteria: TsunamiTransactionsCriteria,
    rangeOptions: TsunamiDataRangeOptions,
  ): AsyncGenerator<TsunamiTransaction, void, undefined> {
    const stream = this.query<TsunamiTransaction>(`/address/${address}/txs`, criteria, rangeOptions);

    for await (const transactions of stream) {
      yield* transactions;
    }
  }

  async *getContractsSelfDestructions(
    criteria: ContractSelfDestructionsCriteria,
    rangeOptions: TsunamiDataRangeOptions,
  ): AsyncGenerator<TsunamiContractSelfDestruction, void, undefined> {
    const stream = this.query<TsunamiContractSelfDestruction>('/contracts/self-destructs', criteria, rangeOptions);

    for await (const selfDestruct of stream) {
      yield* selfDestruct;
    }
  }

  async *getContractsCreations(
    criteria: TsunamiContractCreationCriteria,
    rangeOptions: TsunamiDataRangeOptions,
  ): AsyncGenerator<TsunamiContractSelfDestruction, void, undefined> {
    const stream = this.query<TsunamiContractCreation>('/contracts/creates', criteria, rangeOptions);

    for await (const create of stream) {
      yield* create;
    }
  }

  async getCsvStream(criteria: TsunamiLogsCriteria, rangeOptions: TsunamiStreamRangeOptions) {
    const params = {
      ...rangeOptions,
      ...convertForRequest(criteria),
    };
    const response: AxiosResponse = await this.instance.get('/csv-exports/events', {
      params,
      responseType: 'stream',
    });

    // Return the stream
    return response.data as Readable;
  }
}
