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
        username: "qwerty",
        password: "qwerty"
      },
    },
    filter_type: 'calls',
    name: 'test', description: 'transfers', endpoint_url: 'https://webhook.site/44ba3b7a-f109-47a1-a96e-638b28dd7b2a'
  })

  console.log(`New filter id: ${id}`);

  const newHook = await client.web3hooks.show(id);
  console.log(`Newly created hook: ${JSON.stringify(newHook)}`);

  const hooks = await client.web3hooks.list();
  console.log(`Total of ${hooks.length} hook(s)`)
  for(const hook of hooks) {
    console.log(JSON.stringify(hook));
  }

  await client.web3hooks.delete(id);
}

runWeb3Hooks();
