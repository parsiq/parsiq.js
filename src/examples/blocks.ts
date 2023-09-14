import {Parsiq}from "../client";
import {TsunamiBlock} from "../dto";
import {YOUR_API_KEY} from "./api-key";

async function runBlocks() {
    const client = Parsiq.createClient(YOUR_API_KEY, Parsiq.ChainId.ETH_MAINNET);

    const latestBlock = await client.blocks.getLatest()
    console.log(`Latest block - ${JSON.stringify(latestBlock)}`, '\n');

    const blockByBlockNumber = (await client.blocks.getByBlockNumber(
        0,
        0
    ).next()).value as TsunamiBlock;
    console.log(`Block by number - ${JSON.stringify(blockByBlockNumber)}`, '\n')

    const blockByTimestamp = (await client.blocks.getByTimestamp(
        latestBlock.timestamp!,
        latestBlock.timestamp!
    ).next()).value as TsunamiBlock;
    console.log(`Block by timestamp - ${JSON.stringify(blockByTimestamp)}`, '\n')

    const blockByHash = await client.blocks.getByHash(blockByBlockNumber.hash);
    console.log(`Block by hash - ${JSON.stringify(blockByHash)}`, '\n')

    const blockByBlockNumberWithOffset = (await client.blocks.getByBlockNumber(
        0,
        1,
        {offset: blockByBlockNumber.hash}
    ).next()).value as TsunamiBlock;
    console.log(`Block by block number through offset - ${JSON.stringify(blockByBlockNumberWithOffset)}`, '\n')
}

runBlocks();


