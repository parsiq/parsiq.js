import {Parsiq} from "../src";
import {YOUR_API_KEY} from "./api-key";
import {ABI} from "./abi-example";

export async function runLogs() {
    const client = Parsiq.createClient(YOUR_API_KEY, Parsiq.ChainId.ETH_MAINNET);

    for await (const log of client.logs.getByBlockNumber(
        15724832,
        15724832,
        {topic_0: ['0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef']},
        undefined,
        {limit: 1}
    )) {
        console.log(`Tsunami log - ${JSON.stringify(log)}`, '\n');
    }

    for await (const decodedLog of client.logs.getByBlockNumber(
        15724832,
        15724832,
        {topic_0: ['0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef','0x8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925','0x4c209b5fc8ad50758f13e2e1088ba56a560dff690a1c6fef26394f4c03821c4f']},
        ABI,
        {limit: 3}
    )) {
        console.log(`Client side decoded tsunami log - ${JSON.stringify(decodedLog)}`, '\n');
    }

    client.setDecodingMode(Parsiq.DecodindMode.SERVER);

    for await (const decodedLog of client.logs.getByBlockNumber(
        15724832,
        15724832,
        {topic_0: ['0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef','0x8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925','0x4c209b5fc8ad50758f13e2e1088ba56a560dff690a1c6fef26394f4c03821c4f']},
        ABI,
        {limit: 3}
    )) {
        console.log(`Server side decoded tsunami log - ${JSON.stringify(decodedLog)}`, '\n');
    }
}

runLogs();
