import * as Parsiq from "../src";
import {YOUR_API_KEY} from "./api-key";

export async function runTransfers() {
    const client = Parsiq.createClient(YOUR_API_KEY, Parsiq.ChainId.ETH_MAINNET);

    for await (const walletTransfer of client.transfers.wallet.getByBlockRange(
        '0xD85F68bC77024A730302a97c2e1e07785b01f153',
        14912347,
        14912347,
        {asset_type: [Parsiq.AssetType.NonFungibleToken]},
        {limit: 1}
    )) {
        console.log(`Wallet transfer - ${JSON.stringify(walletTransfer)}`, '\n');
    }

    for await (const tokenTransfer of client.transfers.token.getByBlockRange(
        '0x57f1887a8BF19b14fC0dF6Fd9B2acc9Af147eA85',
        18077332,
        18077332,
        {asset_type: [Parsiq.AssetType.NonFungibleToken], direction: Parsiq.TransferDirection.Outgoing},
        {limit: 1}
    )) {
        console.log(`Token transfer - ${JSON.stringify(tokenTransfer)}`, '\n');
    }

}

runTransfers();
