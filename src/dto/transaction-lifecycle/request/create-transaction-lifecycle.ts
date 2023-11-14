import { DeliveryAuth } from '../../common';

export interface CreateTransactionLifecycle {
  transaction_hash: string;
  confirmations: number;
  endpoint_url: string;
  endpoint_auth?: DeliveryAuth;
}
