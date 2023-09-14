import { TsunamiBlockHashRangeOptions } from './tsunami-block-hash-range-options';

export interface TsunamiDataRangeOptions extends TsunamiBlockHashRangeOptions {
  offset?: string;
  limit?: number;
  batchSize?: number;
}
