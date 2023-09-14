import {Parsiq} from "../src";
import {YOUR_API_KEY} from "./api-key";

export async function runContracts() {
    const client = Parsiq.createClient(YOUR_API_KEY, Parsiq.ChainId.ETH_MAINNET);

    const creation = (await client.contracts.creations.getByBlockHash(
        '0x62094ff27e5aa257dab3a2798370d207996d0814933c585d79fc6efc73f7ac2a',
        {origin: '0xcc2c2cd417a9c39cf0e48622988dbec0b1b37064'},
        {limit: 1}
    ).next()).value ;
    console.log(`Contract creation - ${JSON.stringify(creation)}`, '\n');

    const selfDestruct = (await client.contracts.selfDestructions.getByBlockHash(
        '0x62094ff27e5aa257dab3a2798370d207996d0814933c585d79fc6efc73f7ac2a',
        {origin: '0xcc2c2cd417a9c39cf0e48622988dbec0b1b37064'},
        {limit: 1}
    ).next()).value ;
    console.log(`Contract self destruct - ${JSON.stringify(selfDestruct)}`, '\n');
}

runContracts();
