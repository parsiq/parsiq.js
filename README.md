# PARSIQ API JS client

`parsiq.js` is a library for easy access to all available PARSIQ's APIs.

PARSIQ Network is a full-suite data network for constructing the backend of all Web3 dApps and protocols.
Its fundamental and advanced APIs provide blockchain protocols and their clients with real-time and historical data querying capabilities,
enabling users to build a variety of Web3 data products on top of them.
Our Custom API allows for complex data querying and filtering, designed to meet the specific blockchain data requirements of our customers.
Refer to PARSIQ's documentation for detailed information on how to utilize its APIs.

## Getting Started

Install via npm:

```shell
npm i @parsiq/parsiq.js
```

Set credentials and select a chain to query:

```typescript
import * as Parsiq from '@parsiq/parsiq.js';

const client = new Parsiq.createClient(process.env.TSUNAMI_API_KEY, Parsiq.ChainId.ETH_MAINNET);
```

Don't forget to pass `TSUNAMI_API_KEY` environment variable to your script.

## Usage 

Run requests to Tsunami API:

```typescript
console.log((await client.blocks.getLatest()).number);
```

Fetch logs:

```typescript
for await (const log of client.logs.getByBlockRange(
    0,
    'latest',
    { contract: ['0x1e2fbe6be9eb39fc894d38be976111f332172d83'] },
    {limit: 10}
)) {
    console.log(log);
}
```

Fetch decoded logs:

```typescript
const ABI = {
  //your abi here
};

const decodedLog = (
  await client.logs.getByBlockNumber(15724832, 15724832, {
      topic_0: [
        '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef',
        '0x8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925',
        '0x4c209b5fc8ad50758f13e2e1088ba56a560dff690a1c6fef26394f4c03821c4f',
      ],
    }, ABI, { limit: 1 },
  ).next()).value as TsunamiDecodedLog;

console.log(JSON.stringify(decodedLog));
```

Switch to another chain:

```typescript
client.setChain(ChainId.AVALANCHE_MAINNET);
console.log((await tsunami.blocks.getLatest()).number);
```

## Range options:

Requests that will return multiple entities can accept range options. While similar in nature and names to base API there are some notable differences.

**offset** - as with regular API defines id after which to continue querying.

**limit** - total limit of entities that will be returned.

**batchSize** - determines max amount of entities returned within single http request. 1000 by default

## More documentation

Documentation and examples are available at https://docs.parsiq.net/ 
