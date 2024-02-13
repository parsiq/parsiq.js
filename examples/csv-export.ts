import * as Parsiq from '../src';
import { YOUR_API_KEY } from './api-key';

export async function runCsvExport() {
  const client = Parsiq.createClient(YOUR_API_KEY, Parsiq.ChainId.ETH_MAINNET);

  const stream = await client.logs.csvExport.getByBlockRange(18926000, 18926175, {
    topic_0: ['0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef'],
    contract: ['0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984'],
  });

  let buffer = '';

  stream
    .on('data', chunk => {
      buffer += chunk.toString();
      let newlineIndex;
      while ((newlineIndex = buffer.indexOf('\n')) >= 0) {
        const line = buffer.slice(0, newlineIndex);
        console.log(line);
        buffer = buffer.slice(newlineIndex + 1);
      }
    })
    .on('end', () => {
      if (buffer.length > 0) {
        console.log(buffer);
      }
      console.log('CSV stream processing completed.');
    });
}

void runCsvExport();
