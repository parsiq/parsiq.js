import {
  GetContractCreateQuery,
  GetContractSelfDestructsQuery,
  GetTsunamiCallQuery,
  GetTsunamiEventQuery,
} from '../dto/tsunami';
import {AxiosRequestConfig} from 'axios';
import {IAxiosRetryConfig} from 'axios-retry';
import {GetWalletTransactionsQuery} from '../dto/tsunami/get-wallet-transactions-query';
import {LATEST_TAG} from "../constants";
import {TsunamiRequestHandler} from "./tsunami-request-handler";
import {GetTsunamiTransfersQuery} from "../dto/tsunami/get-tsunami-transfers-query";
import {NftRequestHandler} from "./nft-request-handler";
import {AdditionalNftDataQuery, BasicNftItemDataQuery} from "../dto/nft-datalake";
import {BalancesRequestHandler} from "./balances-request-handler";
import {RangeOptions} from "../dto/common";
import {Exact} from "../utils";

export namespace Parsiq {

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

  export function createClient(apiKey: string, chainId: Parsiq.ChainId, config?: { axiosConfig?: AxiosRequestConfig; retryConfig?: IAxiosRetryConfig }) {
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
    }

    public readonly logs = {
      getByBlockNumber: (blockNumberStart: number, blockNumberEnd: number | typeof LATEST_TAG, criteria: GetTsunamiEventQuery, abi?: any, rangeOptions?: RangeOptions) => {
        if (abi) {
          return this.tsunamiRequestHandler.getDecodedLogs(criteria, {...rangeOptions,
            block_number_start: blockNumberStart,
            block_number_end: blockNumberEnd
          }, abi);
        }
        return this.tsunamiRequestHandler.getLogs(criteria, {...rangeOptions,
          block_number_start: blockNumberStart,
          block_number_end: blockNumberEnd,
        });
      },

      getByTimestamp: (timestampStart: number, timestampEnd: number, criteria: GetTsunamiEventQuery, abi?: any, rangeOptions?: RangeOptions) => {
        if (abi) {
          return this.tsunamiRequestHandler.getDecodedLogs(criteria, {...rangeOptions,
            timestamp_start: timestampStart,
            timestamp_end: timestampEnd
          }, abi);
        }
        return this.tsunamiRequestHandler.getLogs(criteria, {...rangeOptions,
          timestamp_start: timestampStart,
          timestamp_end: timestampEnd
        });
      },

      getByBlockHash: (blockHash: string, criteria: GetTsunamiEventQuery, abi?: any, rangeOptions?: RangeOptions) => {
        if (abi) {
          return this.tsunamiRequestHandler.getDecodedLogs(criteria, {...rangeOptions, block_hash: blockHash}, abi);
        }
        return this.tsunamiRequestHandler.getLogs(criteria, {...rangeOptions, block_hash: blockHash});
      },
    }

    public readonly internalTransactions = {
      getByBlockNumber: (blockNumberStart: number, blockNumberEnd: number | typeof LATEST_TAG, criteria: GetTsunamiCallQuery, abi?: any, rangeOptions?: RangeOptions) => {
        if (abi) {
          return this.tsunamiRequestHandler.getDecodedInternalTransactions(criteria, {...rangeOptions,
            block_number_start: blockNumberStart,
            block_number_end: blockNumberEnd
          }, abi);
        }
        return this.tsunamiRequestHandler.getInternalTransactions(criteria, {...rangeOptions,
          block_number_start: blockNumberStart,
          block_number_end: blockNumberEnd
        });
      },

      getByTimestamp: (timestampStart: number, timestampEnd: number, criteria: GetTsunamiCallQuery, abi?: any, rangeOptions?: RangeOptions) => {
        if (abi) {
          return this.tsunamiRequestHandler.getDecodedInternalTransactions(criteria, {...rangeOptions,
            timestamp_start: timestampStart,
            timestamp_end: timestampEnd
          }, abi);
        }
        return this.tsunamiRequestHandler.getInternalTransactions(criteria, {...rangeOptions,
          timestamp_start: timestampStart,
          timestamp_end: timestampEnd
        });
      },

      getByBlockHash: (blockHash: string, criteria: GetTsunamiCallQuery, abi?: any, rangeOptions?: RangeOptions) => {
        if (abi) {
          return this.tsunamiRequestHandler.getDecodedInternalTransactions(criteria, {...rangeOptions, block_hash: blockHash}, abi);
        }
        return this.tsunamiRequestHandler.getInternalTransactions(criteria, {...rangeOptions, block_hash: blockHash});
      }
    }

    public readonly transactions = {
      byAddress: {
        getByBlockNumber: (address: string, blockNumberStart: number, blockNumberEnd: number | typeof LATEST_TAG, criteria: GetWalletTransactionsQuery, rangeOptions?: RangeOptions) => {
          return this.tsunamiRequestHandler.getTransactions(address, criteria, {...rangeOptions,
            block_number_start: blockNumberStart,
            block_number_end: blockNumberEnd
          });
        },

        getByTimestamp: (address: string, timestampStart: number, timestampEnd: number, criteria: GetWalletTransactionsQuery, rangeOptions?: RangeOptions) => {
          return this.tsunamiRequestHandler.getTransactions(address, criteria, {...rangeOptions,
            timestamp_start: timestampStart,
            timestamp_end: timestampEnd
          });
        },

        getByBlockHash: (address: string, blockHash: string, criteria: GetWalletTransactionsQuery, rangeOptions?: RangeOptions) => {
          return this.tsunamiRequestHandler.getTransactions(address, criteria, {...rangeOptions, block_hash: blockHash});
        },
      },

      getByHash: (transactionHash: string) => {
        return this.tsunamiRequestHandler.getTransaction(transactionHash);
      },

      getTransactionInternals: (transactionHash: string) => {
        return this.tsunamiRequestHandler.getTransactionInternals(transactionHash);
      },

    }

    public readonly contracts = {
      creations: {
        getByBlockRange: (blockNumberStart: number, blockNumberEnd: number | typeof LATEST_TAG, criteria: GetContractCreateQuery, rangeOptions?: RangeOptions) => {
          return this.tsunamiRequestHandler.getContractCreations(criteria, {...rangeOptions,
            block_number_start: blockNumberStart,
            block_number_end: blockNumberEnd
          });
        },

        getByTimestamp: (timestampStart: number, timestampEnd: number, criteria: GetContractCreateQuery, rangeOptions?: RangeOptions) => {
          return this.tsunamiRequestHandler.getContractCreations(criteria, {...rangeOptions,
            timestamp_start: timestampStart,
            block_number_end: timestampEnd
          });
        },

        getByBlockHash: (blockHash: string, criteria: GetContractCreateQuery, rangeOptions?: RangeOptions) => {
          return this.tsunamiRequestHandler.getContractCreations(criteria, {...rangeOptions, block_hash: blockHash});
        },
      },

      selfDestructions: {
        getByBlockRange: (blockNumberStart: number, blockNumberEnd: number | typeof LATEST_TAG, criteria: GetContractSelfDestructsQuery, rangeOptions?: RangeOptions) => {
          return this.tsunamiRequestHandler.getContractSelfDestructions(criteria, {...rangeOptions,
            block_number_start: blockNumberStart,
            block_number_end: blockNumberEnd
          });
        },

        getByTimestamp: (timestampStart: number, timestampEnd: number, criteria: GetContractSelfDestructsQuery, rangeOptions?: RangeOptions) => {
          return this.tsunamiRequestHandler.getContractSelfDestructions(criteria, {...rangeOptions,
            timestamp_start: timestampStart,
            block_number_end: timestampEnd
          });
        },

        getByBlockHash: (blockHash: string, criteria: GetContractSelfDestructsQuery, rangeOptions?: RangeOptions) => {
          return this.tsunamiRequestHandler.getContractSelfDestructions(criteria, {...rangeOptions, block_hash: blockHash});
        },
      },
    }

    public readonly transfers = {
      wallet: {
        getByBlockRange: (address: string, blockNumberStart: number, blockNumberEnd: number | typeof LATEST_TAG, criteria: GetTsunamiTransfersQuery, rangeOptions?: RangeOptions) => {
          return this.tsunamiRequestHandler.getWalletTransfers(address, criteria, {...rangeOptions,
            block_number_start: blockNumberStart,
            block_number_end: blockNumberEnd
          });
        },

        getByTimestamp: (address: string, timestampStart: number, timestampEnd: number, criteria: GetTsunamiTransfersQuery, rangeOptions?: RangeOptions) => {
          return this.tsunamiRequestHandler.getWalletTransfers(address, criteria, {...rangeOptions,
            timestamp_start: timestampStart,
            block_number_end: timestampEnd
          });
        },

        getByBlockHash: (address: string, blockHash: string, criteria: GetTsunamiTransfersQuery, rangeOptions?: RangeOptions) => {
          return this.tsunamiRequestHandler.getWalletTransfers(address, criteria, {...rangeOptions, block_hash: blockHash});
        },
      },
      token: {
        getByBlockRange: (contract: string, blockNumberStart: number, blockNumberEnd: number | typeof LATEST_TAG, criteria: GetTsunamiTransfersQuery, rangeOptions?: RangeOptions) => {
          return this.tsunamiRequestHandler.getContractTransfers(contract, criteria, {...rangeOptions,
            block_number_start: blockNumberStart,
            block_number_end: blockNumberEnd
          });
        },

        getByTimestamp: (contract: string, timestampStart: number, timestampEnd: number, criteria: GetTsunamiTransfersQuery, rangeOptions?: RangeOptions) => {
          return this.tsunamiRequestHandler.getContractTransfers(contract, criteria, {...rangeOptions,
            timestamp_start: timestampStart,
            block_number_end: timestampEnd
          });
        },

        getByBlockHash: (contract: string, blockHash: string, criteria: GetTsunamiTransfersQuery, rangeOptions?: RangeOptions) => {
          return this.tsunamiRequestHandler.getContractTransfers(contract, criteria, {...rangeOptions, block_hash: blockHash});
        },
      },
    }

    public readonly nft = {
      getByAddress: (address: string, criteria: BasicNftItemDataQuery, rangeOptions?: RangeOptions) => {
        return this.nftRequestHandler.getAddressNFTs(address, criteria, {...rangeOptions});
      },

      getAddressHistory: (address: string, criteria: BasicNftItemDataQuery, rangeOptions?: RangeOptions) => {
        return this.nftRequestHandler.getAddressHistory(address, criteria, {...rangeOptions});
      },

      getTokenHistory: (tokenId: string, contract: string, criteria: AdditionalNftDataQuery, rangeOptions?: RangeOptions) => {
        return this.nftRequestHandler.getTokenHistory(tokenId, contract, criteria, {...rangeOptions});
      },

      getCollectionHolders: (contract: string, criteria: AdditionalNftDataQuery, rangeOptions?: RangeOptions) => {
        return this.nftRequestHandler.getCollectionHolders(contract, criteria, {...rangeOptions});
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
}

