import { TransferDirection } from '../../../enum/transfer-direction';

export interface TsunamiTransactionsCriteria {
  include_logs?: boolean;

  direction?: TransferDirection;

  counterparty?: string;
}
