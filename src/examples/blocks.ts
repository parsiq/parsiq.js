import {ParsiqClient} from "../client";
import {ChainId} from "../enum/chain-id";

const client = new ParsiqClient('', ChainId.ETH_MAINNET);
client.blocks.getLatest().then(result => console.log(result));
