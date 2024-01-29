import { TsunamiBlockHashRangeOptions } from './tsunami-block-hash-range-options';

export interface TsunamiStreamRangeOptions extends TsunamiBlockHashRangeOptions {
  offset?: string;
  cu_limit?: number;
}
