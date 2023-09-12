import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import axiosRetry, { IAxiosRetryConfig } from 'axios-retry';
import {ChainId} from "../enum/chain-id";

const baseUrl = (instanceUrl: string, chain: ChainId) => {
  if (!Object.values(ChainId).includes(chain)) {
    throw new Error('Invalid chain provided');
  }
  return instanceUrl + `${chain}/v1/`;
};
export abstract class HttpClient {
  protected readonly instance: AxiosInstance;
  protected readonly instanceUrl: string;

  public constructor(instanceUrl: string, chainId: ChainId, apiKey: string, config: AxiosRequestConfig, retry: IAxiosRetryConfig) {
    this.instance = axios.create({
      ...config,
      baseURL: baseUrl(instanceUrl, chainId),
      auth: { username: apiKey, password: '' },
    });
    this.instanceUrl = instanceUrl;
    axiosRetry(this.instance, retry);
  }

  public setChain(chain: ChainId) {
    this.instance.defaults.baseURL = baseUrl(this.instanceUrl, chain);
  }
}
