import {Parsiq} from "../client";
import {YOUR_API_KEY} from "./api-key";
import {DecodedTsunamiCall, TsunamiCall} from "../dto";
import {ABI} from "./abi-example";


async function runInternalTransactions() {
    const client = Parsiq.createClient(YOUR_API_KEY, Parsiq.ChainId.ETH_MAINNET);

    const internalCall = (await client.internalTransactions.getByBlockNumber(
        0,
        'latest',
        {contract: ['0x7D1AfA7B718fb893dB30A3aBc0Cfc608AaCfeBB0'], include_events: true},
        undefined,
        {limit: 1}
    ).next()).value as TsunamiCall;
    console.log(`Tsunami internal transaction - ${JSON.stringify(internalCall)}`, '\n');

    const decodedInternalCall = (await client.internalTransactions.getByBlockNumber(
        0,
        'latest',
        {contract: ['0x7D1AfA7B718fb893dB30A3aBc0Cfc608AaCfeBB0']},
        ABI,
        {limit: 1})
        .next()).value as DecodedTsunamiCall;
    console.log(`Decoded internal transaction - ${JSON.stringify(decodedInternalCall)}`, '\n');
}

runInternalTransactions();
