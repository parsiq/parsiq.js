import { CreateHook } from '../index';

export interface Web3HookData {
  id: string;
  name: CreateHook['name'];
  description: CreateHook['description'];
  type: CreateHook['filter_type'];
  criteria: CreateHook['criteria'];
  chain_id: number;
  confirmations: CreateHook['confirmations'];
  endpoint_auth: CreateHook['endpoint_auth'];
  endpoint_url: CreateHook['endpoint_url'];
  status: 'enabled' | 'disabled' | 'suspended';
  created_at: Date;
  updated_at: Date;
  reason: string | null;
}
