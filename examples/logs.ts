import {Parsiq, DecodedTsunamiEvent, TsunamiEvent} from "../src";
import {YOUR_API_KEY} from "./api-key";
import {ABI} from "./abi-example";

export async function runLogs() {
    const client = Parsiq.createClient(YOUR_API_KEY, Parsiq.ChainId.ETH_MAINNET);

    const log = (await client.logs.getByBlockNumber(
        15724832,
        15724832,
        {topic_0: ['0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef']},
        undefined,
        {limit: 1}
    ).next()).value as TsunamiEvent;
    console.log(`Tsunami log - ${JSON.stringify(log)}`, '\n');

    const decodedLog = (await client.logs.getByBlockNumber(
        15724832,
        15724832,
        {topic_0: ['0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef','0x8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925','0x4c209b5fc8ad50758f13e2e1088ba56a560dff690a1c6fef26394f4c03821c4f']},
        ABI,
        {limit: 1}
    ).next()).value as DecodedTsunamiEvent;
    console.log(`Decoded log - ${JSON.stringify(decodedLog)}`, '\n');
}

runLogs();
