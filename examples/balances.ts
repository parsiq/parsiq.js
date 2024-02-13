import { YOUR_API_KEY } from './api-key';
import * as Parsiq from '../src';

export async function runBalances() {
  const client = Parsiq.createClient(YOUR_API_KEY, Parsiq.ChainId.ETH_MAINNET);

  for await (const balanceByAddress of client.balances.getByAddress('0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045', {
    limit: 1,
  })) {
    console.log(`Balance info by address - ${JSON.stringify(balanceByAddress)}`, '\n');
  }

  for await (const balanceByContract of client.balances.getByContract('0x362bc847A3a9637d3af6624EeC853618a43ed7D2', {
    limit: 1,
  })) {
    console.log(`Balance info by contract - ${JSON.stringify(balanceByContract)}`, '\n');
  }

  const contractMetadata = await client.balances.getContractMetadata('0x362bc847A3a9637d3af6624EeC853618a43ed7D2');
  console.log(`Contract metadata - ${JSON.stringify(contractMetadata)}`, '\n');
}

void runBalances();
