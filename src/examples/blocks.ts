import {Parsiq}from "../client";
import {TsunamiBlock} from "../dto";
import {YOUR_API_KEY} from "./api-key";

async function runBlocks() {
    const client = Parsiq.createClient(YOUR_API_KEY, Parsiq.ChainId.ETH_MAINNET);

    const latestBlock = await client.blocks.getLatest()
    console.log(`Latest block - block hash: ${latestBlock.hash}, number ${latestBlock.number} and timestamp ${latestBlock.timestamp}`);

    const blockByBlockNumber = (await client.blocks.getByBlockNumber(0, 0).next()).value as TsunamiBlock;
    console.log(`Block by number - block hash: ${blockByBlockNumber.hash}, number ${blockByBlockNumber.number} and timestamp ${blockByBlockNumber.timestamp}`)

    const blockByTimestamp = (await client.blocks.getByTimestamp(latestBlock.timestamp!, latestBlock.timestamp!).next()).value as TsunamiBlock;
    console.log(`Block by timestamp - block hash: ${blockByTimestamp.hash}, number ${blockByTimestamp.number} and timestamp ${blockByTimestamp.timestamp}`)

    const blockByHash = await client.blocks.getByHash(blockByBlockNumber.hash);
    console.log(`Block by hash - block hash: ${blockByHash.hash}, number ${blockByHash.number} and timestamp ${blockByHash.timestamp}`)
}

runBlocks();


