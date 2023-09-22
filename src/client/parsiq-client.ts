import {
  TsunamiContractCreationCriteria,
  ContractSelfDestructionsCriteria,
  TsunamiInternalTransactionsCriteria,
  TsunamiLogsCriteria,
} from '../dto/tsunami';
import { AxiosRequestConfig } from 'axios';
import { IAxiosRetryConfig } from 'axios-retry';
import { TsunamiTransactionsCriteria } from '../dto/tsunami/request/tsunami-transactions-criteria';
import { LATEST_TAG } from '../constants';
import { TsunamiRequestHandler } from './tsunami-request-handler';
import { TsunamiTransfersCriteria } from '../dto/tsunami/request/tsunami-transfers-criteria';
import { NftRequestHandler } from './nft-request-handler';
import { NftSupplementalDataCriteria, NftContractCriteria } from '../dto/nft-datalake';
import { BalancesRequestHandler } from './balances-request-handler';
import { RangeOptions } from '../dto/common';
import { Exact } from '../utils';

export enum DecodindMode {
  SERVER = 'server',
  CLIENT = 'client',
}

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

  public setChain(chainId: ChainId) {
    this.tsunamiRequestHandler.setChain(chainId);
    this.nftRequestHandler.setChain(chainId);
    this.balancesRequestHandler.setChain(chainId);
  }

  public setDecodingMode(mode: DecodindMode) {
    this.tsunamiRequestHandler.setDecodingMode(mode);
  }

  public readonly blocks = {
    getByBlockNumber: (blockNumberStart: number, blockNumberEnd: number, rangeOptions?: Exact<RangeOptions>) => {
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
    getByBlockNumber: (
      blockNumberStart: number,
      blockNumberEnd: number | typeof LATEST_TAG,
      criteria: TsunamiLogsCriteria,
      abi?: any,
      rangeOptions?: RangeOptions,
    ) => {
      if (abi) {
        return this.tsunamiRequestHandler.getDecodedLogs(
          criteria,
          { ...rangeOptions, block_number_start: blockNumberStart, block_number_end: blockNumberEnd },
          abi,
        );
      }
      return this.tsunamiRequestHandler.getLogs(criteria, {
        ...rangeOptions,
        block_number_start: blockNumberStart,
        block_number_end: blockNumberEnd,
      });
    },

    getByTimestamp: (
      timestampStart: number,
      timestampEnd: number,
      criteria: TsunamiLogsCriteria,
      abi?: any,
      rangeOptions?: RangeOptions,
    ) => {
      if (abi) {
        return this.tsunamiRequestHandler.getDecodedLogs(
          criteria,
          { ...rangeOptions, timestamp_start: timestampStart, timestamp_end: timestampEnd },
          abi,
        );
      }
      return this.tsunamiRequestHandler.getLogs(criteria, {
        ...rangeOptions,
        timestamp_start: timestampStart,
        timestamp_end: timestampEnd,
      });
    },

    getByBlockHash: (blockHash: string, criteria: TsunamiLogsCriteria, abi?: any, rangeOptions?: RangeOptions) => {
      if (abi) {
        return this.tsunamiRequestHandler.getDecodedLogs(
          criteria,
          {
            ...rangeOptions,
            block_hash: blockHash,
          },
          abi,
        );
      }
      return this.tsunamiRequestHandler.getLogs(criteria, { ...rangeOptions, block_hash: blockHash });
    },
  };

  public readonly internalTransactions = {
    getByBlockNumber: (
      blockNumberStart: number,
      blockNumberEnd: number | typeof LATEST_TAG,
      criteria: TsunamiInternalTransactionsCriteria,
      abi?: any,
      rangeOptions?: RangeOptions,
    ) => {
      if (abi) {
        return this.tsunamiRequestHandler.getDecodedInternalTransactions(
          criteria,
          { ...rangeOptions, block_number_start: blockNumberStart, block_number_end: blockNumberEnd },
          abi,
        );
      }
      return this.tsunamiRequestHandler.getInternalTransactions(criteria, {
        ...rangeOptions,
        block_number_start: blockNumberStart,
        block_number_end: blockNumberEnd,
      });
    },

    getByTimestamp: (
      timestampStart: number,
      timestampEnd: number,
      criteria: TsunamiInternalTransactionsCriteria,
      abi?: any,
      rangeOptions?: RangeOptions,
    ) => {
      if (abi) {
        return this.tsunamiRequestHandler.getDecodedInternalTransactions(
          criteria,
          { ...rangeOptions, timestamp_start: timestampStart, timestamp_end: timestampEnd },
          abi,
        );
      }
      return this.tsunamiRequestHandler.getInternalTransactions(criteria, {
        ...rangeOptions,
        timestamp_start: timestampStart,
        timestamp_end: timestampEnd,
      });
    },

    getByBlockHash: (
      blockHash: string,
      criteria: TsunamiInternalTransactionsCriteria,
      abi?: any,
      rangeOptions?: RangeOptions,
    ) => {
      if (abi) {
        return this.tsunamiRequestHandler.getDecodedInternalTransactions(
          criteria,
          { ...rangeOptions, block_hash: blockHash },
          abi,
        );
      }
      return this.tsunamiRequestHandler.getInternalTransactions(criteria, {
        ...rangeOptions,
        block_hash: blockHash,
      });
    },
  };

  public readonly transactions = {
    byAddress: {
      getByBlockNumber: (
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
          block_number_end: timestampEnd,
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
          block_number_end: timestampEnd,
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
          block_number_end: timestampEnd,
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
          block_number_end: timestampEnd,
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
}
