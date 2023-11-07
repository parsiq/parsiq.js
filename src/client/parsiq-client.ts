import {
  TsunamiContractCreationCriteria,
  ContractSelfDestructionsCriteria,
  TsunamiInternalTransactionsCriteria,
  TsunamiLogsCriteria,
  TsunamiLog,
  TsunamiDecodedLog,
  TsunamiAbi,
  TsunamiInternalTransaction,
  TsunamiDecodedInternalTransaction,
} from '../dto/tsunami';
import { AxiosRequestConfig } from 'axios';
import { IAxiosRetryConfig } from 'axios-retry';
import { TsunamiTransactionsCriteria } from '../dto/tsunami/request/tsunami-transactions-criteria';
import { LATEST_TAG } from '../constants';
import { TsunamiRequestHandler } from './tsunami-request-handler';
import { TsunamiTransfersCriteria } from '../dto/tsunami/request/tsunami-transfers-criteria';
import { NftRequestHandler } from './nft-request-handler';
import { NftSupplementalDataCriteria, NftContractCriteria } from '../dto/nft-api';
import { BalancesRequestHandler } from './balances-request-handler';
import { RangeOptions } from '../dto/common';
import { Exact } from '../utils';
import { CreateHook } from '../dto/web3-hooks';
import { Web3HooksRequestHandler } from './web3hooks-request-handler';

export enum ChainId {
  ETH_MAINNET = 'eip155-1', // Eth Mainnet
  ETH_GOERLI = 'eip155-5', // Eth Goerli
  ETH_SEPOLIA = 'eip155-11155111', // Eth Goerli
  AVALANCHE_MAINNET = 'eip155-43114', // Avax Mainnet
  BNB_MAINNET = 'eip155-56', // BNB Chain Mainnet
  POLYGON_MAINNET = 'eip155-137', // Polygon Mainnet
  ARBITRUM_NITRO_MAINNET = 'eip155-42161', // Arbitrum Mainnet
  METIS_MAINNET = 'eip155-1088', // Metis Mainnet
  POLYGON_ZKEVM_MAINNET = 'eip155-1101', // Polygon zkEVM Mainnet
  BNB_TESTNET = 'eip155-97',
  OPBNB_TESTNET = 'eip155-5611', // opBNB Testnet
  POLYGON_MUMBAI = 'eip155-80001',
}

export function createClient(
  apiKey: string,
  chainId: ChainId,
  config?: { axiosConfig?: AxiosRequestConfig; retryConfig?: IAxiosRetryConfig },
) {
  return new ParsiqClient(apiKey, chainId, config);
}

class ParsiqClient {
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
    this.web3HooksRequestHandler = new Web3HooksRequestHandler(apiKey, chain, config);
  }

  public readonly web3hooks = {
    create: (createHook: CreateHook) => {
      return this.web3HooksRequestHandler.createHook(createHook);
    },
  };

  public readonly blocks = {
    getByBlockRange: (
      blockNumberStart: number,
      blockNumberEnd: number | typeof LATEST_TAG,
      rangeOptions?: Exact<RangeOptions>,
    ) => {
      return this.tsunamiRequestHandler.getBlocksByNumber(blockNumberStart, blockNumberEnd, rangeOptions);
    },

    getByTimestamp: (start: number, end: number, rangeOptions?: Exact<RangeOptions>) => {
      return this.tsunamiRequestHandler.getBlocksByTimestamp(start, end, rangeOptions);
    },

    getByHash: (blockHash: string) => {
      return this.tsunamiRequestHandler.getBlockByHash(blockHash);
    },

    getLatest: () => {
      return this.tsunamiRequestHandler.getLatestBlock();
    },
  };

  public readonly logs = {
    getByTimestamp: this.getLogsByTimestamp.bind(this),
    getByBlockRange: this.getLogsByBlockRange.bind(this),
    getByBlockHash: this.getLogsByBlockHash.bind(this),
  };

  public readonly internalTransactions = {
    getByTimestamp: this.getInternalTransactionsByTimestamp.bind(this),
    getByBlockRange: this.getInternalTransactionsByBlockRange.bind(this),
    getByBlockHash: this.getInternalTransactionsByBlockHash.bind(this),
  };

  public readonly transactions = {
    byAddress: {
      getByBlockRange: (
        address: string,
        blockNumberStart: number,
        blockNumberEnd: number | typeof LATEST_TAG,
        criteria: TsunamiTransactionsCriteria,
        rangeOptions?: RangeOptions,
      ) => {
        return this.tsunamiRequestHandler.getTransactions(address, criteria, {
          ...rangeOptions,
          block_number_start: blockNumberStart,
          block_number_end: blockNumberEnd,
        });
      },

      getByTimestamp: (
        address: string,
        timestampStart: number,
        timestampEnd: number,
        criteria: TsunamiTransactionsCriteria,
        rangeOptions?: RangeOptions,
      ) => {
        return this.tsunamiRequestHandler.getTransactions(address, criteria, {
          ...rangeOptions,
          timestamp_start: timestampStart,
          timestamp_end: timestampEnd,
        });
      },

      getByBlockHash: (
        address: string,
        blockHash: string,
        criteria: TsunamiTransactionsCriteria,
        rangeOptions?: RangeOptions,
      ) => {
        return this.tsunamiRequestHandler.getTransactions(address, criteria, {
          ...rangeOptions,
          block_hash: blockHash,
        });
      },
    },

    getByHash: (transactionHash: string) => {
      return this.tsunamiRequestHandler.getTransaction(transactionHash);
    },

    getTransactionInternals: (transactionHash: string) => {
      return this.tsunamiRequestHandler.getTransactionInternals(transactionHash);
    },
  };

  public readonly contracts = {
    creations: {
      getByBlockRange: (
        blockNumberStart: number,
        blockNumberEnd: number | typeof LATEST_TAG,
        criteria: TsunamiContractCreationCriteria,
        rangeOptions?: RangeOptions,
      ) => {
        return this.tsunamiRequestHandler.getContractsCreations(criteria, {
          ...rangeOptions,
          block_number_start: blockNumberStart,
          block_number_end: blockNumberEnd,
        });
      },

      getByTimestamp: (
        timestampStart: number,
        timestampEnd: number,
        criteria: TsunamiContractCreationCriteria,
        rangeOptions?: RangeOptions,
      ) => {
        return this.tsunamiRequestHandler.getContractsCreations(criteria, {
          ...rangeOptions,
          timestamp_start: timestampStart,
          timestamp_end: timestampEnd,
        });
      },

      getByBlockHash: (blockHash: string, criteria: TsunamiContractCreationCriteria, rangeOptions?: RangeOptions) => {
        return this.tsunamiRequestHandler.getContractsCreations(criteria, {
          ...rangeOptions,
          block_hash: blockHash,
        });
      },
    },

    selfDestructions: {
      getByBlockRange: (
        blockNumberStart: number,
        blockNumberEnd: number | typeof LATEST_TAG,
        criteria: ContractSelfDestructionsCriteria,
        rangeOptions?: RangeOptions,
      ) => {
        return this.tsunamiRequestHandler.getContractsSelfDestructions(criteria, {
          ...rangeOptions,
          block_number_start: blockNumberStart,
          block_number_end: blockNumberEnd,
        });
      },

      getByTimestamp: (
        timestampStart: number,
        timestampEnd: number,
        criteria: ContractSelfDestructionsCriteria,
        rangeOptions?: RangeOptions,
      ) => {
        return this.tsunamiRequestHandler.getContractsSelfDestructions(criteria, {
          ...rangeOptions,
          timestamp_start: timestampStart,
          timestamp_end: timestampEnd,
        });
      },

      getByBlockHash: (blockHash: string, criteria: ContractSelfDestructionsCriteria, rangeOptions?: RangeOptions) => {
        return this.tsunamiRequestHandler.getContractsSelfDestructions(criteria, {
          ...rangeOptions,
          block_hash: blockHash,
        });
      },
    },
  };

  public readonly transfers = {
    wallet: {
      getByBlockRange: (
        address: string,
        blockNumberStart: number,
        blockNumberEnd: number | typeof LATEST_TAG,
        criteria: TsunamiTransfersCriteria,
        rangeOptions?: RangeOptions,
      ) => {
        return this.tsunamiRequestHandler.getWalletTransfers(address, criteria, {
          ...rangeOptions,
          block_number_start: blockNumberStart,
          block_number_end: blockNumberEnd,
        });
      },

      getByTimestamp: (
        address: string,
        timestampStart: number,
        timestampEnd: number,
        criteria: TsunamiTransfersCriteria,
        rangeOptions?: RangeOptions,
      ) => {
        return this.tsunamiRequestHandler.getWalletTransfers(address, criteria, {
          ...rangeOptions,
          timestamp_start: timestampStart,
          timestamp_end: timestampEnd,
        });
      },

      getByBlockHash: (
        address: string,
        blockHash: string,
        criteria: TsunamiTransfersCriteria,
        rangeOptions?: RangeOptions,
      ) => {
        return this.tsunamiRequestHandler.getWalletTransfers(address, criteria, {
          ...rangeOptions,
          block_hash: blockHash,
        });
      },
    },
    token: {
      getByBlockRange: (
        contract: string,
        blockNumberStart: number,
        blockNumberEnd: number | typeof LATEST_TAG,
        criteria: TsunamiTransfersCriteria,
        rangeOptions?: RangeOptions,
      ) => {
        return this.tsunamiRequestHandler.getTokenTransfers(contract, criteria, {
          ...rangeOptions,
          block_number_start: blockNumberStart,
          block_number_end: blockNumberEnd,
        });
      },

      getByTimestamp: (
        contract: string,
        timestampStart: number,
        timestampEnd: number,
        criteria: TsunamiTransfersCriteria,
        rangeOptions?: RangeOptions,
      ) => {
        return this.tsunamiRequestHandler.getTokenTransfers(contract, criteria, {
          ...rangeOptions,
          timestamp_start: timestampStart,
          timestamp_end: timestampEnd,
        });
      },

      getByBlockHash: (
        contract: string,
        blockHash: string,
        criteria: TsunamiTransfersCriteria,
        rangeOptions?: RangeOptions,
      ) => {
        return this.tsunamiRequestHandler.getTokenTransfers(contract, criteria, {
          ...rangeOptions,
          block_hash: blockHash,
        });
      },
    },
  };

  public readonly nft = {
    getByAddress: (address: string, criteria: NftContractCriteria, rangeOptions?: RangeOptions) => {
      return this.nftRequestHandler.getNftByAddress(address, criteria, { ...rangeOptions });
    },

    getAddressHistory: (address: string, criteria: NftContractCriteria, rangeOptions?: RangeOptions) => {
      return this.nftRequestHandler.getNftHistoryByAddress(address, criteria, { ...rangeOptions });
    },

    getTokenHistory: (
      tokenId: string,
      contract: string,
      criteria: NftSupplementalDataCriteria,
      rangeOptions?: RangeOptions,
    ) => {
      return this.nftRequestHandler.getNftHistory(tokenId, contract, criteria, { ...rangeOptions });
    },

    getCollectionHolders: (contract: string, criteria: NftSupplementalDataCriteria, rangeOptions?: RangeOptions) => {
      return this.nftRequestHandler.getCollectionHolders(contract, criteria, { ...rangeOptions });
    },

    getMetadata: (tokenId: string, contract: string) => {
      return this.nftRequestHandler.getNftMetadata(tokenId, contract);
    },

    getCollectionMetadata: (contract: string) => {
      return this.nftRequestHandler.getCollectionMetadata(contract);
    },
  };

  public readonly balances = {
    getByAddress: (address: string, rangeOptions?: RangeOptions) => {
      return this.balancesRequestHandler.getByAddress(address, { ...rangeOptions });
    },

    getByContract: (contract: string, rangeOptions?: RangeOptions) => {
      return this.balancesRequestHandler.getByContract(contract, { ...rangeOptions });
    },

    getContractMetadata: (contract: string) => {
      return this.balancesRequestHandler.getContractMetadata(contract);
    },
  };

  private readonly tsunamiRequestHandler: TsunamiRequestHandler;
  private readonly nftRequestHandler: NftRequestHandler;
  private readonly balancesRequestHandler: BalancesRequestHandler;
  private readonly web3HooksRequestHandler: Web3HooksRequestHandler;

  public setChain(chainId: ChainId) {
    this.tsunamiRequestHandler.setChain(chainId);
    this.nftRequestHandler.setChain(chainId);
    this.balancesRequestHandler.setChain(chainId);
  }

  private isTsunamiAbi(value: any): value is TsunamiAbi {
    return value && typeof value.abi !== 'undefined';
  }

  private getLogsByTimestamp(
    timestampStart: number,
    timestampEnd: number,
    criteria: TsunamiLogsCriteria,
    rangeOptions?: RangeOptions,
  ): AsyncGenerator<TsunamiLog, void, undefined>;
  private getLogsByTimestamp(
    timestampStart: number,
    timestampEnd: number,
    criteria: TsunamiLogsCriteria,
    abi: TsunamiAbi,
    rangeOptions?: RangeOptions,
  ): AsyncGenerator<TsunamiDecodedLog, void, undefined>;

  private getLogsByTimestamp(
    timestampStart: number,
    timestampEnd: number,
    criteria: TsunamiLogsCriteria,
    abiOrRange?: TsunamiAbi | RangeOptions,
    rangeOptions?: RangeOptions,
  ) {
    if (this.isTsunamiAbi(abiOrRange)) {
      return this.tsunamiRequestHandler.getDecodedLogs(
        criteria,
        { ...rangeOptions, timestamp_start: timestampStart, timestamp_end: timestampEnd },
        abiOrRange,
      );
    }
    return this.tsunamiRequestHandler.getLogs(criteria, {
      ...(abiOrRange as RangeOptions),
      timestamp_start: timestampStart,
      timestamp_end: timestampEnd,
    });
  }

  private getLogsByBlockRange(
    blockNumberStart: number,
    blockNumberEnd: number | typeof LATEST_TAG,
    criteria: TsunamiLogsCriteria,
    rangeOptions?: RangeOptions,
  ): AsyncGenerator<TsunamiLog, void, undefined>;
  private getLogsByBlockRange(
    blockNumberStart: number,
    blockNumberEnd: number | typeof LATEST_TAG,
    criteria: TsunamiLogsCriteria,
    abi: TsunamiAbi,
    rangeOptions?: RangeOptions,
  ): AsyncGenerator<TsunamiDecodedLog, void, undefined>;

  private getLogsByBlockRange(
    blockNumberStart: number,
    blockNumberEnd: number | typeof LATEST_TAG,
    criteria: TsunamiLogsCriteria,
    abiOrRange?: TsunamiAbi | RangeOptions,
    rangeOptions?: RangeOptions,
  ) {
    if (this.isTsunamiAbi(abiOrRange)) {
      return this.tsunamiRequestHandler.getDecodedLogs(
        criteria,
        { ...rangeOptions, block_number_start: blockNumberStart, block_number_end: blockNumberEnd },
        abiOrRange,
      );
    }
    return this.tsunamiRequestHandler.getLogs(criteria, {
      ...(abiOrRange as RangeOptions),
      block_number_start: blockNumberStart,
      block_number_end: blockNumberEnd,
    });
  }

  private getLogsByBlockHash(
    blockHash: string,
    criteria: TsunamiLogsCriteria,
    rangeOptions?: RangeOptions,
  ): AsyncGenerator<TsunamiLog, void, undefined>;
  private getLogsByBlockHash(
    blockHash: string,
    criteria: TsunamiLogsCriteria,
    abi: TsunamiAbi,
    rangeOptions?: RangeOptions,
  ): AsyncGenerator<TsunamiDecodedLog, void, undefined>;

  private getLogsByBlockHash(
    blockHash: string,
    criteria: TsunamiLogsCriteria,
    abiOrRange?: TsunamiAbi | RangeOptions,
    rangeOptions?: RangeOptions,
  ) {
    if (this.isTsunamiAbi(abiOrRange)) {
      return this.tsunamiRequestHandler.getDecodedLogs(
        criteria,
        {
          ...rangeOptions,
          block_hash: blockHash,
        },
        abiOrRange,
      );
    }
    return this.tsunamiRequestHandler.getLogs(criteria, { ...(abiOrRange as RangeOptions), block_hash: blockHash });
  }

  private getInternalTransactionsByBlockRange(
    blockNumberStart: number,
    blockNumberEnd: number | typeof LATEST_TAG,
    criteria: TsunamiInternalTransactionsCriteria,
    rangeOptions?: RangeOptions,
  ): AsyncGenerator<TsunamiInternalTransaction, void, undefined>;
  private getInternalTransactionsByBlockRange(
    blockNumberStart: number,
    blockNumberEnd: number | typeof LATEST_TAG,
    criteria: TsunamiInternalTransactionsCriteria,
    abi: TsunamiAbi,
    rangeOptions?: RangeOptions,
  ): AsyncGenerator<TsunamiDecodedInternalTransaction, void, undefined>;

  private getInternalTransactionsByBlockRange(
    blockNumberStart: number,
    blockNumberEnd: number | typeof LATEST_TAG,
    criteria: TsunamiInternalTransactionsCriteria,
    abiOrRange?: TsunamiAbi | RangeOptions,
    rangeOptions?: RangeOptions,
  ) {
    if (this.isTsunamiAbi(abiOrRange)) {
      return this.tsunamiRequestHandler.getDecodedInternalTransactions(
        criteria,
        { ...rangeOptions, block_number_start: blockNumberStart, block_number_end: blockNumberEnd },
        abiOrRange,
      );
    }
    return this.tsunamiRequestHandler.getInternalTransactions(criteria, {
      ...(abiOrRange as RangeOptions),
      block_number_start: blockNumberStart,
      block_number_end: blockNumberEnd,
    });
  }

  private getInternalTransactionsByTimestamp(
    timestampStart: number,
    timestampEnd: number,
    criteria: TsunamiInternalTransactionsCriteria,
    rangeOptions?: RangeOptions,
  ): AsyncGenerator<TsunamiInternalTransaction, void, undefined>;
  private getInternalTransactionsByTimestamp(
    timestampStart: number,
    timestampEnd: number,
    criteria: TsunamiInternalTransactionsCriteria,
    abi: TsunamiAbi,
    rangeOptions?: RangeOptions,
  ): AsyncGenerator<TsunamiDecodedInternalTransaction, void, undefined>;

  private getInternalTransactionsByTimestamp(
    timestampStart: number,
    timestampEnd: number,
    criteria: TsunamiInternalTransactionsCriteria,
    abiOrRange?: TsunamiAbi | RangeOptions,
    rangeOptions?: RangeOptions,
  ) {
    if (this.isTsunamiAbi(abiOrRange)) {
      return this.tsunamiRequestHandler.getDecodedInternalTransactions(
        criteria,
        { ...rangeOptions, timestamp_start: timestampStart, timestamp_end: timestampEnd },
        abiOrRange,
      );
    }
    return this.tsunamiRequestHandler.getInternalTransactions(criteria, {
      ...(abiOrRange as RangeOptions),
      timestamp_start: timestampStart,
      timestamp_end: timestampEnd,
    });
  }

  private getInternalTransactionsByBlockHash(
    blockHash: string,
    criteria: TsunamiInternalTransactionsCriteria,
    rangeOptions?: RangeOptions,
  ): AsyncGenerator<TsunamiInternalTransaction, void, undefined>;
  private getInternalTransactionsByBlockHash(
    blockHash: string,
    criteria: TsunamiInternalTransactionsCriteria,
    abi: TsunamiAbi,
    rangeOptions?: RangeOptions,
  ): AsyncGenerator<TsunamiDecodedInternalTransaction, void, undefined>;

  private getInternalTransactionsByBlockHash(
    blockHash: string,
    criteria: TsunamiInternalTransactionsCriteria,
    abiOrRange?: TsunamiAbi | RangeOptions,
    rangeOptions?: RangeOptions,
  ) {
    if (this.isTsunamiAbi(abiOrRange)) {
      return this.tsunamiRequestHandler.getDecodedInternalTransactions(
        criteria,
        { ...rangeOptions, block_hash: blockHash },
        abiOrRange,
      );
    }
    return this.tsunamiRequestHandler.getInternalTransactions(criteria, {
      ...(abiOrRange as RangeOptions),
      block_hash: blockHash,
    });
  }
}
