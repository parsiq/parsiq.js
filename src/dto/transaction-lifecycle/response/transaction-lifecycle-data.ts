export interface TransactionLifecycleData {
  id: string;
  tx_hash: string;
  chain_id: number;
  desired_confirmations: number;
  endpoint_auth?: Record<string, any>;
  endpoint_url: string;
  created_at: Date;
}
