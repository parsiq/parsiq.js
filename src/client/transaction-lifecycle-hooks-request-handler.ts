import { HttpClient } from './http-client';
import * as Parsiq from './parsiq-client';
import { AxiosRequestConfig, isAxiosError } from 'axios';
import { IAxiosRetryConfig } from 'axios-retry';
import { TSUNAMI_BASE_URL } from './urls';
import { TsunamiError } from './tsunami-error';
import { CreateTransactionLifecycle, TransactionLifecycleData } from '../dto/transaction-lifecycle';

export class TransactionLifecycleHooksRequestHandler extends HttpClient {
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

  public async createTxLcHook(createHook: CreateTransactionLifecycle): Promise<string> {
    const response = await this.instance.post<{ id: string }>('/transaction-lifecycle', createHook, {}).catch(error => {
      if (isAxiosError(error)) {
        throw new TsunamiError(
          error.response?.data?.message ?? "Couldn't create transaction lifecycle",
          error.response?.status ?? null,
          error.response?.data?.error ?? null,
          error.cause ?? null,
        );
      }
      throw new TsunamiError("Couldn't create transaction lifecycle", null, null, error);
    });
    return response.data.id;
  }

  public async listTxLcHooks(): Promise<TransactionLifecycleData[]> {
    const response = await this.instance.get<TransactionLifecycleData[]>('/transaction-lifecycle', {}).catch(error => {
      throw this.getRequestProcessingError(error);
    });
    return response.data;
  }

  public async getTxLcHook(id: string): Promise<TransactionLifecycleData> {
    const response = await this.instance
      .get<TransactionLifecycleData>(`/transaction-lifecycle/${id}`, {})
      .catch(error => {
        throw this.getRequestProcessingError(error);
      });
    return response.data;
  }

  public async deleteTxLcHook(id: string): Promise<void> {
    await this.instance.delete<TransactionLifecycleData[]>(`/transaction-lifecycle/${id}`, {}).catch(error => {
      throw this.getRequestProcessingError(error);
    });
  }

  public setChain(chain: Parsiq.ChainId) {
    this.instance.defaults.baseURL = this.baseUrl(this.instanceUrl, chain);
  }

  private baseUrl(instanceUrl: string, chain: Parsiq.ChainId) {
    if (!Object.values(Parsiq.ChainId).includes(chain)) {
      throw new Error('Invalid chain provided');
    }
    return instanceUrl + `${chain}/v1/`;
  }
}
