import {Parsiq} from "../client";
import {YOUR_API_KEY} from "./api-key";
import {DecodedTsunamiCall, TsunamiCall} from "../dto";
import {ABI} from "./abi-example";


async function runInternalTransactions() {
    const client = Parsiq.createClient(YOUR_API_KEY, Parsiq.ChainId.ETH_MAINNET);

    const internalCall = (await client.internalTransactions.getByBlockNumber(0, 'latest', {contract: ['0x7D1AfA7B718fb893dB30A3aBc0Cfc608AaCfeBB0'], include_events: true}, undefined, {limit: 1})
        .next()).value as TsunamiCall;
    console.log(`Tsunami internal transaction - with id: ${internalCall.id}, block hash: ${internalCall.block_hash}, block number ${internalCall.block_number}, contract: ${internalCall.contract} and included log: ${JSON.stringify(internalCall.events)}`);
    //TODO: included logs are called 'events' on response level, need to find way to rename or hide it?

    const decodedInternalCall = (await client.internalTransactions.getByBlockNumber(0, 'latest',
        {contract: ['0x7D1AfA7B718fb893dB30A3aBc0Cfc608AaCfeBB0']},
        ABI, {limit: 1})
        .next()).value as DecodedTsunamiCall;
    console.log(`Decoded part of the internal transaction - ${JSON.stringify(decodedInternalCall.decoded)}`);
}

runInternalTransactions();
