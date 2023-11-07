import { HttpClient } from './http-client';
import * as Parsiq from './parsiq-client';
import { AxiosRequestConfig, isAxiosError } from 'axios';
import { IAxiosRetryConfig } from 'axios-retry';
import { WEB_3_HOOKS_BASE_URL } from './urls';
import { TsunamiError } from './tsunami-error';
import { CreateHook } from '../dto/web3-hooks';

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
    super(WEB_3_HOOKS_BASE_URL, chain, apiKey, axiosConfig, retryConfig);
  }

  public async createHook(createHook: CreateHook): Promise<string> {
    const response = await this.instance.post<string>('/filters', createHook, {}).catch(error => {
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
    return response.data;
  }
}
