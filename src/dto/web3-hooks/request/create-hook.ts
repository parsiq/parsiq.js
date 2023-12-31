import { TsunamiInternalTransactionsCriteria, TsunamiLogsCriteria } from '../../tsunami';
import { DeliveryAuth } from '../../common';

export interface CreateHook {
  name: string;
  description?: string;
  confirmations?: number;
  filter_type: 'events' | 'calls';
  criteria: TsunamiLogsCriteria | TsunamiInternalTransactionsCriteria;
  endpoint_url: string;
  endpoint_auth?: DeliveryAuth;
}
