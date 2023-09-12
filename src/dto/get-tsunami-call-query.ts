import { BasicTsunamiDataQuery } from './basic-tsunami-data-query';

export interface GetTsunamiCallQuery extends BasicTsunamiDataQuery {
  sender?: string;
  sig_hash?: string[];
  include_events?: boolean;
}
