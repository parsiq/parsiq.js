import * as Parsiq from '../src';
import { YOUR_API_KEY } from './api-key';

export async function runTransactions() {
  const client = Parsiq.createClient(YOUR_API_KEY, Parsiq.ChainId.ETH_MAINNET);

  for await (const transaction of client.transactions.byAddress.getByBlockRange(
    '0x690B9A9E9aa1C9dB991C7721a92d351Db4FaC990',
    0,
    'latest',
    {},
    { limit: 1 },
  )) {
    console.log(`Transaction - ${JSON.stringify(transaction)}`, '\n');
  }

  const transactionInternals = await client.transactions.getTransactionInternals(
    '0xdc85aff5829fb1db3640e9c153ec7582c378ca2ff17b152450039b5692dac884',
    { include_failed_calls: true },
  );
  console.log(`Transaction with logs - ${JSON.stringify(transactionInternals)}`, '\n');
}

void runTransactions();
