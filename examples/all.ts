import {runLogs} from "./logs";
import {runInternalTransactions} from "./internal-transactions";
import {runTransfers} from "./transfers";
import {runBlocks} from "./blocks";
import {runTransactions} from "./transactions";
import {runContracts} from "./contracts";
import {runNFTs} from "./nft";
import {runBalances} from "./balances";

async function runAllExamples() {
    await runBlocks();
    await runLogs();
    await runInternalTransactions();
    await runTransactions();
    await runContracts();
    await runTransfers();
    await runNFTs();
    await runBalances();
}

runAllExamples();
