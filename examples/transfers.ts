import * as Parsiq from "../src";
import {YOUR_API_KEY} from "./api-key";

export async function runTransfers() {
    const client = Parsiq.createClient(YOUR_API_KEY, Parsiq.ChainId.ETH_MAINNET);

    for await (const walletTransfer of client.transfers.wallet.getByBlockRange(
        '0xD85F68bC77024A730302a97c2e1e07785b01f153',
        14912347,
        14912347,
        {asset_type: [Parsiq.AssetType.NonFungibleToken],
            contract: ['0xcaace84b015330c0ab4bd003f6fa0b84ec6c64ac', '0xcaace84b015330c0ab4bd003f6fa0b84ec6c64aa'],
            origin: '0x6d053f09684ee1c231b417cc1e502ef50b1b5697'},
        {limit: 1}
    )) {
        console.log(`Wallet transfer - ${JSON.stringify(walletTransfer)}`, '\n');
    }

    for await (const tokenTransfer of client.transfers.token.getByBlockRange(
        '0x57f1887a8BF19b14fC0dF6Fd9B2acc9Af147eA85',
        18077332,
        18077332,
        {asset_type: [Parsiq.AssetType.NonFungibleToken],
            direction: Parsiq.TransferDirection.Outgoing,
            origin: '0xace57139c755de2f2d6d6882f3a92b5ac1525fbb'},
        {limit: 1}
    )) {
        console.log(`Token transfer - ${JSON.stringify(tokenTransfer)}`, '\n');
    }

}

runTransfers();
