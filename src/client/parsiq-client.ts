import {
  GetContractCreateQuery,
  GetContractSelfDestructsQuery,
  GetTsunamiCallQuery,
  GetTsunamiEventQuery,
} from '../dto';
import {AxiosRequestConfig} from 'axios';
import {IAxiosRetryConfig} from 'axios-retry';
import {ChainId} from '../enum/chain-id';
import {GetWalletTransactionsQuery} from '../dto/get-wallet-transactions-query';
import {LATEST_TAG} from "../constants";
import {TsunamiRequestHandler} from "./tsunami-request-handler";
import {GetTsunamiTransfersQuery} from "../dto/get-tsunami-transfers-query";
import {NftRequestHandler} from "./nft-request-handler";
import {AdditionalNftDataQuery, BasicNftItemDataQuery} from "../dto/nft-datalake";
import {BalancesRequestHandler} from "./balances-request-handler";

export class ParsiqClient {

  private readonly tsunamiRequestHandler: TsunamiRequestHandler;
  private readonly nftRequestHandler: NftRequestHandler;
  private readonly balancesRequestHandler: BalancesRequestHandler;
  constructor(
    apiKey: string,
    chain: ChainId,
    config: { axiosConfig?: AxiosRequestConfig; retryConfig?: IAxiosRetryConfig } = {
      axiosConfig: {},
      retryConfig: {},
    },
  ) {
    this.tsunamiRequestHandler = new TsunamiRequestHandler(apiKey, chain, config);
    this.nftRequestHandler = new NftRequestHandler(apiKey, chain, config);
    this.balancesRequestHandler = new BalancesRequestHandler(apiKey, chain, config);
  }

  public readonly blocks = {
    getByNumber: (blockNumber: number) => {
      return this.tsunamiRequestHandler.getBlockByNumber(blockNumber);
    },

    getByTimestamp: (start: number, end: number) => {
      return this.tsunamiRequestHandler.getBlocksByTimestamp(start, end);
    },

    getByHash: (blockHash: string) => {
      return this.tsunamiRequestHandler.getBlockByHash(blockHash);
    },

    getLatest:() => {
      return this.tsunamiRequestHandler.getLatestBlock();
    },
  }

  public readonly logs = {
    getByBlockRange: (blockNumberStart: number, blockNumberEnd: number | typeof LATEST_TAG, criteria: GetTsunamiEventQuery) => {
      return this.tsunamiRequestHandler.getEvents(criteria, {block_number_start: blockNumberStart, block_number_end: blockNumberEnd});
    },

    getByTimestamp: (timestampStart: number, timestampEnd: number, criteria: GetTsunamiEventQuery) => {
      return this.tsunamiRequestHandler.getEvents(criteria, {timestamp_start: timestampStart, timestamp_end: timestampEnd});
    },

    getByBlockHash: (blockHash: string, criteria: GetTsunamiEventQuery) => {
      return this.tsunamiRequestHandler.getEvents(criteria, {block_hash: blockHash});
    }
  }

  public readonly internalTransactions = {
    getByBlockRange: (blockNumberStart: number, blockNumberEnd: number | typeof LATEST_TAG, criteria: GetTsunamiCallQuery) => {
      return this.tsunamiRequestHandler.getCalls(criteria, {block_number_start: blockNumberStart, block_number_end: blockNumberEnd});
    },

    getByTimestamp: (timestampStart: number, timestampEnd: number, criteria: GetTsunamiCallQuery) => {
      return this.tsunamiRequestHandler.getCalls(criteria, {timestamp_start: timestampStart, timestamp_end: timestampEnd});
    },

    getByBlockHash: (blockHash: string, criteria: GetTsunamiCallQuery) => {
      return this.tsunamiRequestHandler.getCalls(criteria, {block_hash: blockHash});
    }
  }

  public readonly transactions = {
    byAddress: {
      getByBlockRange: (address: string, blockNumberStart: number, blockNumberEnd: number | typeof LATEST_TAG, criteria: GetWalletTransactionsQuery) => {
        return this.tsunamiRequestHandler.getWalletTransactions(address, criteria, {block_number_start: blockNumberStart, block_number_end: blockNumberEnd});
      },

      getByTimestamp: (address: string, timestampStart: number, timestampEnd: number, criteria: GetWalletTransactionsQuery) => {
        return this.tsunamiRequestHandler.getWalletTransactions(address, criteria, {timestamp_start: timestampStart, timestamp_end: timestampEnd});
      },

      getByBlockHash: (address: string, blockHash: string, criteria: GetWalletTransactionsQuery) => {
        return this.tsunamiRequestHandler.getWalletTransactions(address, criteria, {block_hash: blockHash});
      },
    },

    getByHash:(transactionHash: string) => {
      return this.tsunamiRequestHandler.getTransaction(transactionHash);
    },

    getTransactionLogs: (transactionHash: string) => {
      return this.tsunamiRequestHandler.getTransactionWithLogs(transactionHash);
    },

  }

  public readonly contracts = {
    creations: {
      getByBlockRange:(blockNumberStart: number, blockNumberEnd: number | typeof LATEST_TAG, criteria: GetContractCreateQuery) => {
        return this.tsunamiRequestHandler.getContractCreates(criteria, {block_number_start: blockNumberStart, block_number_end: blockNumberEnd});
      },

      getByTimestamp: (timestampStart: number, timestampEnd: number, criteria: GetContractCreateQuery) => {
        return this.tsunamiRequestHandler.getContractCreates(criteria, {timestamp_start: timestampStart, block_number_end: timestampEnd});
      },

      getByBlockHash: (blockHash: string, criteria: GetContractCreateQuery) => {
        return this.tsunamiRequestHandler.getContractCreates(criteria, {block_hash: blockHash});
      },
    },

    destructions: {
      getByBlockRange:(blockNumberStart: number, blockNumberEnd: number | typeof LATEST_TAG, criteria: GetContractSelfDestructsQuery) => {
        return this.tsunamiRequestHandler.getContractSelfDestructs(criteria, {block_number_start: blockNumberStart, block_number_end: blockNumberEnd});
      },

      getByTimestamp: (timestampStart: number, timestampEnd: number, criteria: GetContractSelfDestructsQuery) => {
        return this.tsunamiRequestHandler.getContractSelfDestructs(criteria, {timestamp_start: timestampStart, block_number_end: timestampEnd});
      },

      getByBlockHash: (blockHash: string, criteria: GetContractSelfDestructsQuery) => {
        return this.tsunamiRequestHandler.getContractSelfDestructs(criteria, {block_hash: blockHash});
      },
    },
  }

  public readonly transfers = {
    wallet: {
      getByBlockRange:(address: string, blockNumberStart: number, blockNumberEnd: number | typeof LATEST_TAG, criteria: GetTsunamiTransfersQuery) => {
        return this.tsunamiRequestHandler.getTransfers(address, criteria, {block_number_start: blockNumberStart, block_number_end: blockNumberEnd});
      },

      getByTimestamp: (address: string, timestampStart: number, timestampEnd: number, criteria: GetTsunamiTransfersQuery) => {
        return this.tsunamiRequestHandler.getTransfers(address, criteria, {timestamp_start: timestampStart, block_number_end: timestampEnd});
      },

      getByBlockHash: (address: string, blockHash: string, criteria: GetTsunamiTransfersQuery) => {
        return this.tsunamiRequestHandler.getTransfers(address, criteria, {block_hash: blockHash});
      },
    },
    token: {
      getByBlockRange:(address: string, blockNumberStart: number, blockNumberEnd: number | typeof LATEST_TAG, criteria: GetTsunamiTransfersQuery) => {
        return this.tsunamiRequestHandler.getContractTransfers(address, criteria, {block_number_start: blockNumberStart, block_number_end: blockNumberEnd});
      },

      getByTimestamp: (address: string, timestampStart: number, timestampEnd: number, criteria: GetTsunamiTransfersQuery) => {
        return this.tsunamiRequestHandler.getContractTransfers(address, criteria, {timestamp_start: timestampStart, block_number_end: timestampEnd});
      },

      getByBlockHash: (address: string, blockHash: string, criteria: GetTsunamiTransfersQuery) => {
        return this.tsunamiRequestHandler.getContractTransfers(address, criteria, {block_hash: blockHash});
      },
    },
  }

  public readonly nft = {
    getByAddress: (address: string, criteria: BasicNftItemDataQuery) => {
      return this.nftRequestHandler.getAddressNFTs(address, criteria,{});
    },

    getAddressHistory: (address: string, criteria: BasicNftItemDataQuery) => {
      return this.nftRequestHandler.getAddressHistory(address, criteria,{});
    },

    getTokenHistory: (tokenId: string, contract: string, criteria: AdditionalNftDataQuery) => {
      return this.nftRequestHandler.getTokenHistory(tokenId, contract, criteria, {});
    },

    getCollectionHolders: (contract: string, criteria: AdditionalNftDataQuery) => {
      return this.nftRequestHandler.getCollectionHolders(contract, criteria, {});
    },

    getMetadata: (tokenId: string, contract: string) => {
      return this.nftRequestHandler.getTokenMetadata(tokenId, contract);
    },

    getContractMetadata: (contract: string) => {
      return this.nftRequestHandler.getContractMetadata(contract);
    },
  }

  public readonly balances = {
    getByAddress: (address: string) => {
      return this.balancesRequestHandler.getByAddress(address);
    },

    getByContract: (contract: string) => {
      return this.balancesRequestHandler.getByContract(contract);
    },

    getContractMetadata: (contract: string) => {
      return this.balancesRequestHandler.getContractMetadata(contract);
    },
  }
}

