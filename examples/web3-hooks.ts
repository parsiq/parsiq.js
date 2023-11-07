import { YOUR_API_KEY } from "./api-key";
import * as Parsiq from "../src";
import { HttpAuthType } from "../src";

export async function runWeb3Hooks() {
  const client = Parsiq.createClient(YOUR_API_KEY, Parsiq.ChainId.ETH_MAINNET);

  const id = await client.web3hooks.create({
    criteria: { sender: '0x3ab96d0a0d7921dfe542af8081c0f1bc21429893' },
    endpoint_auth: {
      type: HttpAuthType.basic,
      credentials: {
        username: "eugene",
        password: "qwerty"
      },
    },
    filter_type: 'calls',
    name: 'test', description: 'transfers', endpoint_url: 'https://webhook.site/44ba3b7a-f109-47a1-a96e-638b28dd7b2b'
  })
}

runWeb3Hooks();
