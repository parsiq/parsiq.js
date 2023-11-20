import { HttpClient } from './http-client';
import * as Parsiq from './parsiq-client';
import { AxiosRequestConfig, isAxiosError } from 'axios';
import { IAxiosRetryConfig } from 'axios-retry';
import { TSUNAMI_BASE_URL } from './urls';
import { TsunamiError } from './tsunami-error';
import { CreateHook, Web3HookData } from '../dto/web3-hooks';

export class Web3HooksRequestHandler extends HttpClient {
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

  public async createWeb3Hook(createHook: CreateHook): Promise<string> {
    const response = await this.instance.post<{ id: string }>('/filters', createHook, {}).catch(error => {
      if (isAxiosError(error)) {
        throw new TsunamiError(
          error.response?.data?.message ?? "Couldn't create filter",
          error.response?.status ?? null,
          error.response?.data?.error ?? null,
          error.cause ?? null,
        );
      }
      throw new TsunamiError("Couldn't create filter", null, null, error);
    });
    return response.data.id;
  }

  public async listWeb3Hooks(): Promise<Web3HookData[]> {
    const response = await this.instance.get<Web3HookData[]>('/filters', {}).catch(error => {
      throw this.getRequestProcessingError(error);
    });
    return response.data;
  }

  public async getWeb3Hook(id: string): Promise<Web3HookData> {
    const response = await this.instance.get<Web3HookData>(`/filters/${id}`, {}).catch(error => {
      throw this.getRequestProcessingError(error);
    });
    return response.data;
  }

  public async deleteWeb3Hook(id: string): Promise<void> {
    await this.instance.delete<Web3HookData[]>(`/filters/${id}`, {}).catch(error => {
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
