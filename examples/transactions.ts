import * as Parsiq from "../src";
import {YOUR_API_KEY} from "./api-key";

export async function runTransactions() {
    const client = Parsiq.createClient(YOUR_API_KEY, Parsiq.ChainId.ETH_MAINNET);

    for await (const transaction of client.transactions.byAddress.getByBlockNumber(
        '0x690B9A9E9aa1C9dB991C7721a92d351Db4FaC990',
        0,
        'latest',
        {},
        {limit: 1}
    )) {
        console.log(`Transaction - ${JSON.stringify(transaction)}`, '\n');
    }

    const transactionInternals = await client.transactions.getTransactionInternals('0x83c9fb2a58546693ee4e29554789c164c9ec30d6218cffbbd800a248f7b399bf');
    console.log(`Transaction with logs - ${JSON.stringify(transactionInternals)}`, '\n');

}

runTransactions();
