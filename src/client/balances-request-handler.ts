import { HttpClient } from './http-client';
import { AxiosRequestConfig } from 'axios';
import { IAxiosRetryConfig } from 'axios-retry';
import {
  BalancesTokenHolderByAddressItem,
  BalancesTokenHolderByContractItem,
  BalancesTokenInfoItemWithSupplies,
} from '../dto/balances-datalake';
import { BALANCES_BASE_URL } from './urls';
import * as Parsiq from './parsiq-client';
import { RangeOptions } from '../dto/common';

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
    const { axiosConfig = {}, retryConfig = {} } = config;
    super(BALANCES_BASE_URL, chain, apiKey, axiosConfig, retryConfig);
  }

  public async *getByAddress(
    address: string,
    boundaries: RangeOptions,
  ): AsyncGenerator<BalancesTokenHolderByAddressItem, void, undefined> {
    const iterator = this.query<BalancesTokenHolderByAddressItem>(`/addresses/${address}/tokens`, {}, boundaries);
    for await (const data of iterator) {
      yield* data;
    }
  }

  public async *getByContract(
    contract: string,
    boundaries: RangeOptions,
  ): AsyncGenerator<BalancesTokenHolderByContractItem, void, undefined> {
    const iterator = this.query<BalancesTokenHolderByContractItem>(`/tokens/${contract}/holders`, {}, boundaries);
    for await (const data of iterator) {
      yield* data;
    }
  }

  public async getContractMetadata(contract: string): Promise<BalancesTokenInfoItemWithSupplies> {
    try {
      const response = await this.instance.get<BalancesTokenInfoItemWithSupplies>(`/tokens/${contract}`);
      if (!response?.data) {
        throw new Error(MALFORMED_RESPONSE_MESSAGE);
      }

      return response.data;
    } catch (error) {
      throw this.getRequestProcessingError(error);
    }
  }
}
