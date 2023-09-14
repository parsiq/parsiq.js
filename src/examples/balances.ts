import {YOUR_API_KEY} from "./api-key";
import {Parsiq} from "../client";

async function runBalances() {
    const client = Parsiq.createClient(YOUR_API_KEY, Parsiq.ChainId.ETH_MAINNET);

    const balanceByAddress = (await client.balances.getByAddress(
        '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045'
    ).next()).value;
    console.log(`Balance info by address - ${JSON.stringify(balanceByAddress)}`, '\n');

    const balanceByContract = (await client.balances.getByContract(
        '0x362bc847A3a9637d3af6624EeC853618a43ed7D2'
    ).next()).value;
    console.log(`Balance info by contract - ${JSON.stringify(balanceByContract)}`, '\n');
}

runBalances();
