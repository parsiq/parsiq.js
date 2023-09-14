import {Parsiq, TsunamiDecodedInternalTransaction, TsunamiInternalTransaction} from "../src";
import {YOUR_API_KEY} from "./api-key";
import {ABI} from "./abi-example";

export async function runInternalTransactions() {
    const client = Parsiq.createClient(YOUR_API_KEY, Parsiq.ChainId.ETH_MAINNET);

    const internalCall = (await client.internalTransactions.getByBlockNumber(
        0,
        'latest',
        {contract: ['0x7D1AfA7B718fb893dB30A3aBc0Cfc608AaCfeBB0'], include_events: true},
        undefined,
        {limit: 1}
    ).next()).value as TsunamiInternalTransaction;
    console.log(`Tsunami internal transaction - ${JSON.stringify(internalCall)}`, '\n');

    const decodedInternalCall = (await client.internalTransactions.getByBlockNumber(
        0,
        'latest',
        {contract: ['0x7D1AfA7B718fb893dB30A3aBc0Cfc608AaCfeBB0']},
        ABI,
        {limit: 1})
        .next()).value as TsunamiDecodedInternalTransaction;
    console.log(`Decoded internal transaction - ${JSON.stringify(decodedInternalCall)}`, '\n');
}

runInternalTransactions();
