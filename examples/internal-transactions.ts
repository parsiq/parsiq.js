import * as Parsiq from '../src';
import { YOUR_API_KEY } from './api-key';
import { ABI, CORRUPTED_ABI } from './abi-example';

export async function runInternalTransactions() {
  const client = Parsiq.createClient(YOUR_API_KEY, Parsiq.ChainId.ETH_MAINNET);

  for await (const internalTransaction of client.internalTransactions.getByBlockRange(
    0,
    'latest',
    { contract: ['0x7D1AfA7B718fb893dB30A3aBc0Cfc608AaCfeBB0'], include_events: true },
    { limit: 1 },
  )) {
    console.log(`Tsunami internal transaction - ${JSON.stringify(internalTransaction)}`, '\n');
  }

  for await (const decodedInternalTransaction of client.internalTransactions.getByBlockRange(
    0,
    'latest',
    { contract: ['0x7D1AfA7B718fb893dB30A3aBc0Cfc608AaCfeBB0'], include_events: true },
    ABI,
    { limit: 3 },
  )) {
    console.log(
      `Client side decoded tsunami internal transaction - ${JSON.stringify(decodedInternalTransaction)}`,
      '\n',
    );
  }

  for await (const decodedInternalTransaction of client.internalTransactions.getByBlockRange(
    0,
    'latest',
    { contract: ['0x7D1AfA7B718fb893dB30A3aBc0Cfc608AaCfeBB0'], include_events: true },
    CORRUPTED_ABI,
    { limit: 3 },
  )) {
    console.log(
      `Client side decoded tsunami internal transaction with errors - ${JSON.stringify(decodedInternalTransaction)}`,
      '\n',
    );
  }
}

void runInternalTransactions();
