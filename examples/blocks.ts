import * as Parsiq from '../src';
import { YOUR_API_KEY } from './api-key';

export async function runBlocks() {
  const client = Parsiq.createClient(YOUR_API_KEY, Parsiq.ChainId.ETH_MAINNET);

  const latestBlock = await client.blocks.getLatest();
  console.log(`Latest block - ${JSON.stringify(latestBlock)}`, '\n');

  for await (const blockByBlockNumber of client.blocks.getByBlockRange(0, 'latest', { limit: 1 })) {
    console.log(`Block by number - ${JSON.stringify(blockByBlockNumber)}`, '\n');
  }

  for await (const blockByTimestamp of client.blocks.getByTimestamp(latestBlock.timestamp!, latestBlock.timestamp!)) {
    console.log(`Block by timestamp - ${JSON.stringify(blockByTimestamp)}`, '\n');
  }

  const blockByHash = await client.blocks.getByHash(
    '0xd4e56740f876aef8c010b86a40d5f56745a118d0906a34e69aec8c0db1cb8fa3',
  );
  console.log(`Block by hash - ${JSON.stringify(blockByHash)}`, '\n');

  for await (const blockByBlockNumberWithOffset of client.blocks.getByBlockRange(0, 1, {
    offset: '0xd4e56740f876aef8c010b86a40d5f56745a118d0906a34e69aec8c0db1cb8fa3',
  })) {
    console.log(`Block by block number through offset - ${JSON.stringify(blockByBlockNumberWithOffset)}`, '\n');
  }
}

void runBlocks();
