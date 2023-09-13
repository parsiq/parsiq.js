import {Parsiq} from "../client";
import {YOUR_API_KEY} from "./api-key";
import {TsunamiTransaction} from "../dto";

async function runTransactions() {
    const client = Parsiq.createClient(YOUR_API_KEY, Parsiq.ChainId.ETH_MAINNET);

    const transaction = (await client.transactions.byAddress.getByBlockNumber('0x690B9A9E9aa1C9dB991C7721a92d351Db4FaC990', 0, 'latest', {}, {limit: 1} ).next()).value as TsunamiTransaction;
    console.log(JSON.stringify(transaction));
}

runTransactions();
