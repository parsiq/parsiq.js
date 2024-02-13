import { YOUR_API_KEY } from './api-key';
import * as Parsiq from '../src';
import { HttpAuthType } from '../src';

export async function runTransactionLifecycles() {
  const client = Parsiq.createClient(YOUR_API_KEY, Parsiq.ChainId.ETH_MAINNET);

  const id = await client.txLifecycleHooks.create({
    endpoint_auth: {
      type: HttpAuthType.basic,
      credentials: {
        username: 'qwerty',
        password: 'qwerty',
      },
    },
    confirmations: 10,
    endpoint_url: 'https://webhook.site/44ba3b7a-f109-47a1-a96e-638b28dd7b2a',
    transaction_hash: '0x4dbbde61d5857669c5ab42129d8419711b0aad79ee81d5fcb27c611bfd77aa7c',
  });

  console.log(`New transaction lifecycle id: ${id}`);

  const newHook = await client.txLifecycleHooks.get(id);
  console.log(`Newly created transaction lifecycle: ${JSON.stringify(newHook)}`);

  const hooks = await client.txLifecycleHooks.list();
  console.log(`Total of ${hooks.length} transaction lifecycle(s)`);
  for (const hook of hooks) {
    console.log(JSON.stringify(hook));
  }

  await client.txLifecycleHooks.delete(id);
}

void runTransactionLifecycles();
