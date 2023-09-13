import axios, {AxiosInstance, AxiosRequestConfig, isAxiosError} from 'axios';
import axiosRetry, { IAxiosRetryConfig } from 'axios-retry';
import {TsunamiError} from "./tsunami-error";
import {convertForRequest} from "./convertor";
import {BasicRangeParams} from "../dto/common";
import {Parsiq} from "./parsiq-client";

const MALFORMED_RESPONSE_MESSAGE = 'Malformed server response';
const REQUEST_FAILED_MESSAGE = 'Server request failed';

const baseUrl = (instanceUrl: string, chain: Parsiq.ChainId) => {
  if (!Object.values(Parsiq.ChainId).includes(chain)) {
    throw new Error('Invalid chain provided');
  }
  return instanceUrl + `${chain}/v1/`;
};
export abstract class HttpClient {
  protected readonly instance: AxiosInstance;
  protected readonly instanceUrl: string;

  protected constructor(instanceUrl: string, chainId: Parsiq.ChainId, apiKey: string, config: AxiosRequestConfig, retry: IAxiosRetryConfig) {
    this.instance = axios.create({
      ...config,
      baseURL: baseUrl(instanceUrl, chainId),
      auth: { username: apiKey, password: '' },
    });
    this.instanceUrl = instanceUrl;
    axiosRetry(this.instance, retry);
  }

  public setChain(chain: Parsiq.ChainId) {
    this.instance.defaults.baseURL = baseUrl(this.instanceUrl, chain);
  }

  protected async *query<
      Item = any,
  >(
      endpoint: string,
      criteria: Record<string, any>,
      boundaries: Record<string, any>,
      body?: any,
  ): AsyncGenerator<Item[]> {
    let offset: string | undefined;
    let hasMore;
    const hardLimit = boundaries.limit ?? Infinity;
    let fetched = 0;
    do {
      const params = {
        ...boundaries,
        ...convertForRequest(criteria),
        ...(offset ? { offset } : {}),
        limit: Math.min(boundaries.batchSize ?? 1000, boundaries.limit ?? 1000, 1000),
      };

      const response = body===undefined ? await this.doRequest<Item>(endpoint, params) : await this.postRequest<Item>(endpoint, body, params);

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
      Item  = any,
  >(endpoint: string, params: Record<string, string | number>) {
    const response = await this.instance
        .get<{ range: BasicRangeParams; items: Item[] }>(endpoint, {
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

  protected async postRequest<
      Item = any,
  >(endpoint: string, body: any, params: Record<string, string | number>) {
    const response = await this.instance
        .post<{ range: BasicRangeParams; items: Item[] }>(endpoint, body, {
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

  protected getRequestProcessingError(error: any) {
    if (isAxiosError(error)) {
      return new TsunamiError(
          error.response?.data?.message ?? REQUEST_FAILED_MESSAGE,
          error.response?.status ?? null,
          error.response?.data?.error ?? null,
          error.cause ?? null,
      );
    }
    return new TsunamiError(REQUEST_FAILED_MESSAGE, null, null, error);
  }
}
