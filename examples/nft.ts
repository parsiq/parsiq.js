import * as Parsiq from '../src';
import { YOUR_API_KEY } from './api-key';

export async function runNFTs() {
  const client = Parsiq.createClient(YOUR_API_KEY, Parsiq.ChainId.ETH_MAINNET);

  for await (const nftByAddress of client.nft.getByAddress(
    '0xb6042f438D63181E7E220A72e9fff845062EB48d',
    { metadata: true, sale_price: true },
    { limit: 1 },
  )) {
    console.log(`Nft by address - ${JSON.stringify(nftByAddress)}`, '\n');
  }

  for await (const addressHistory of client.nft.getAddressHistory(
    '0xb6042f438D63181E7E220A72e9fff845062EB48d',
    { contract: '0x36d7b711390d34e8fe26ad8f2bb14e7c8f0c56e9', metadata: true, sale_price: true },
    { limit: 1 },
  )) {
    console.log(`Nft address history item - ${JSON.stringify(addressHistory)}`, '\n');
  }

  for await (const tokenHistoryItem of client.nft.getTokenHistory(
    '5340',
    '0x282BDD42f4eb70e7A9D9F40c8fEA0825B7f68C5D',
    {},
    { limit: 1 },
  )) {
    console.log(`Token history item - ${JSON.stringify(tokenHistoryItem)}`, '\n');
  }

  for await (const collectionHolder of client.nft.getCollectionHolders(
    '0xBC4CA0EdA7647A8aB7C2061c2E118A18a936f13D',
    { metadata: true },
    { limit: 1 },
  )) {
    console.log(`Collection holder - ${JSON.stringify(collectionHolder)}`, '\n');
  }

  const metadata = await client.nft.getMetadata('1', '0xBC4CA0EdA7647A8aB7C2061c2E118A18a936f13D');
  console.log(`NFT metadata - ${JSON.stringify(metadata)}`, '\n');

  const contractMetadata = await client.nft.getCollectionMetadata('0xBC4CA0EdA7647A8aB7C2061c2E118A18a936f13D');
  console.log(`Contract metadata - ${JSON.stringify(contractMetadata)}`, '\n');
}

void runNFTs();
