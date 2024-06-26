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
  TsunamiTransactionInternalsCriteria,
  TsunamiWalletTransferCriteria,
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
import { ExportRangeOptions, RangeOptions } from '../dto/common';
import { Exact } from '../utils';
import { CreateHook } from '../dto/web3-hooks';
import { Web3HooksRequestHandler } from './web3hooks-request-handler';
import { TransactionLifecycleHooksRequestHandler } from './transaction-lifecycle-hooks-request-handler';
import { CreateTransactionLifecycle } from '../dto/transaction-lifecycle';

export enum ChainId {
  ETH_MAINNET = 'eip155-1',
  ETH_HOLESKY = 'eip155-17000',
  ETH_SEPOLIA = 'eip155-11155111',
  AVALANCHE_MAINNET = 'eip155-43114',
  BNB_MAINNET = 'eip155-56',
  POLYGON_MAINNET = 'eip155-137',
  ARBITRUM_NITRO_MAINNET = 'eip155-42161',
  METIS_MAINNET = 'eip155-1088',
  POLYGON_ZKEVM_MAINNET = 'eip155-1101',
  BNB_TESTNET = 'eip155-97',
  OPBNB_TESTNET = 'eip155-5611',
  ARBITRUM_SEPOLIA = 'eip155-421614',
  POLYGON_AMOY = 'eip155-80002',
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
    this.transactionLifecycleRequestHandler = new TransactionLifecycleHooksRequestHandler(apiKey, chain, config);
  }

  public readonly txLifecycleHooks = {
    create: (createTransactionLifecycle: CreateTransactionLifecycle) => {
      return this.transactionLifecycleRequestHandler.createTxLcHook(createTransactionLifecycle);
    },

    list: () => {
      return this.transactionLifecycleRequestHandler.listTxLcHooks();
    },

    get: (id: string) => {
      return this.transactionLifecycleRequestHandler.getTxLcHook(id);
    },

    delete: (id: string) => {
      return this.transactionLifecycleRequestHandler.deleteTxLcHook(id);
    },
  };

  public readonly web3Hooks = {
    create: (createHook: CreateHook) => {
      return this.web3HooksRequestHandler.createWeb3Hook(createHook);
    },

    list: () => {
      return this.web3HooksRequestHandler.listWeb3Hooks();
    },

    get: (id: string) => {
      return this.web3HooksRequestHandler.getWeb3Hook(id);
    },

    delete: (id: string) => {
      return this.web3HooksRequestHandler.deleteWeb3Hook(id);
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

    csvExport: {
      getByBlockRange: (
        blockNumberStart: number,
        blockNumberEnd: number | typeof LATEST_TAG,
        criteria: TsunamiLogsCriteria,
        rangeOptions?: ExportRangeOptions,
      ) => {
        return this.tsunamiRequestHandler.getCsvStream(criteria, {
          block_number_start: blockNumberStart,
          block_number_end: blockNumberEnd,
          ...rangeOptions,
        });
      },

      getByTimestamp: (
        start: number,
        end: number,
        criteria: TsunamiLogsCriteria,
        rangeOptions?: ExportRangeOptions,
      ) => {
        return this.tsunamiRequestHandler.getCsvStream(criteria, {
          timestamp_start: start,
          timestamp_end: end,
          ...rangeOptions,
        });
      },

      getByBlockHash: (hash: string, criteria: TsunamiLogsCriteria, rangeOptions?: ExportRangeOptions) => {
        return this.tsunamiRequestHandler.getCsvStream(criteria, {
          block_hash: hash,
          ...rangeOptions,
        });
      },
    },
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

    getTransactionInternals: (transactionHash: string, criteria?: TsunamiTransactionInternalsCriteria) => {
      return this.tsunamiRequestHandler.getTransactionInternals(transactionHash, criteria);
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
        criteria: TsunamiWalletTransferCriteria,
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
        criteria: TsunamiWalletTransferCriteria,
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
        criteria: TsunamiWalletTransferCriteria,
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
  private readonly transactionLifecycleRequestHandler: TransactionLifecycleHooksRequestHandler;

  public setChain(chainId: ChainId) {
    this.tsunamiRequestHandler.setChain(chainId);
    this.nftRequestHandler.setChain(chainId);
    this.balancesRequestHandler.setChain(chainId);
    this.web3HooksRequestHandler.setChain(chainId);
    this.transactionLifecycleRequestHandler.setChain(chainId);
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
