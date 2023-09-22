import {
  TsunamiDecodedLogBelongingToInternalTransaction,
  TsunamiDecodedInternalTransaction,
  TsunamiDecodedLog,
  TsunamiDecodingErrorInternalTransaction,
  TsunamiDecodingErrorLog,
  TsunamiInternalTransaction,
  TsunamiLog,
  TsunamiDecodingErrorLogBelongingToInternalTransaction,
  TsunamiLogBelongingToInternalTransaction,
  TsunamiAbi,
} from '../dto/tsunami';
import { Fragment, Indexed, Interface, ParamType, Result } from '@ethersproject/abi';

type ValueOrArray<T> = T | ValueOrArray<T>[];

export const decodeTsunamiLog = (log: TsunamiLog, abi: TsunamiAbi): TsunamiDecodedLog | TsunamiDecodingErrorLog => {
  let decoded: any | null;
  let error: string | null = null;

  try {
    decoded = decodeTsunamiLogBasedData(log, new Interface(abi.abi));
  } catch (err) {
    error = err?.message;
  }
  if (error) {
    return {
      ...log,
      ...{ error },
      decoded: null,
    } as TsunamiDecodingErrorLog;
  }
  return {
    id: log.id,
    tx_hash: log.tx_hash,
    block_hash: log.block_hash,
    block_number: log.block_number,
    timestamp: log.timestamp,
    op_code: log.op_code,
    origin: log.origin,
    contract: log.contract,
    decoded,
  } as TsunamiDecodedLog;
};

export const decodeTsunamiLogForInternalTransaction = (
  log: TsunamiLogBelongingToInternalTransaction,
  abi: TsunamiAbi,
): TsunamiDecodedLogBelongingToInternalTransaction | TsunamiDecodingErrorLogBelongingToInternalTransaction => {
  let decoded: any | null;
  let error: string | null = null;

  try {
    decoded = decodeTsunamiLogBasedData(log, new Interface(abi.abi));
  } catch (err) {
    error = err?.message;
  }
  if (error) {
    return {
      ...log,
      ...{ error },
      decoded: null,
    } as TsunamiDecodingErrorLogBelongingToInternalTransaction;
  }
  return {
    op_code: log.op_code,
    contract: log.contract,
    decoded,
  } as TsunamiDecodedLogBelongingToInternalTransaction;
};

export const decodeTsunamiInternalTransaction = (
  internalTransaction: TsunamiInternalTransaction,
  abi: TsunamiAbi,
): TsunamiDecodedInternalTransaction | TsunamiDecodingErrorInternalTransaction => {
  let decoded: any | null = null;
  let error: null | string = null;

  const decode = (call: TsunamiInternalTransaction, abiInterface: Interface) => {
    const functionFragment = abiInterface.getFunction(call.sig_hash);
    const decoded = abiInterface.decodeFunctionData(functionFragment, call.input_data);

    return {
      function: functionFragment.name,
      ...extractDecodedProps(functionFragment, decoded),
    };
  };

  try {
    decoded = decode(internalTransaction, new Interface(abi.abi));
  } catch (err) {
    error = err?.message;
  }

  let events:
    | readonly (
        | TsunamiDecodedLogBelongingToInternalTransaction
        | TsunamiDecodingErrorLogBelongingToInternalTransaction
      )[]
    | null = null;
  if (internalTransaction.events) {
    events = internalTransaction.events.map(event => {
      return decodeTsunamiLogForInternalTransaction(event, abi);
    }); //this.getDecodedEvents(item.events, abi) as readonly DecodedHistoricalEventBelongingToCall[];
  }
  if (error) {
    return {
      id: internalTransaction.id,
      sig_hash: internalTransaction.sig_hash,
      input_data: internalTransaction.input_data,
      sender: internalTransaction.sender,
      tx_hash: internalTransaction.tx_hash,
      block_hash: internalTransaction.block_hash,
      block_number: internalTransaction.block_number,
      timestamp: internalTransaction.timestamp,
      origin: internalTransaction.origin,
      contract: internalTransaction.contract,
      value: internalTransaction.value,
      ...(events ? { events } : {}),
      ...{ error },
      decoded: null,
    } as TsunamiDecodingErrorInternalTransaction;
  }

  return {
    id: internalTransaction.id,
    sender: internalTransaction.sender,
    tx_hash: internalTransaction.tx_hash,
    block_hash: internalTransaction.block_hash,
    block_number: internalTransaction.block_number,
    timestamp: internalTransaction.timestamp,
    origin: internalTransaction.origin,
    contract: internalTransaction.contract,
    value: internalTransaction.value,
    ...(events ? { events } : {}),
    decoded,
  } as TsunamiDecodedInternalTransaction;
};

const decodeTsunamiLogBasedData = (
  tsunamiLog: TsunamiLog | TsunamiLogBelongingToInternalTransaction,
  abiInterface: Interface,
) => {
  const eventFragment = abiInterface.getEvent(tsunamiLog.topic_0 ?? '');

  const decoded = abiInterface.decodeEventLog(
    eventFragment,
    String(tsunamiLog.log_data ?? ''),
    [tsunamiLog.topic_0, tsunamiLog.topic_1, tsunamiLog.topic_2, tsunamiLog.topic_3].filter(
      topic => typeof topic === 'string',
    ) as string[],
  );

  return {
    event: eventFragment.name,
    ...extractDecodedProps(eventFragment, decoded),
  };
};

const extractDecodedProps = (fragment: Fragment, decoded: Result) => {
  return fragment.inputs.reduce((acc, input, index) => {
    const name = getFragmentInputName(input, index);

    return { ...acc, [name]: transformParsedDataInput(input.type, decoded[index]) };
  }, {});
};

const transformParsedDataInput = (inputType: string, value: any): ValueOrArray<string> => {
  switch (inputType) {
    case 'address':
      return value.toString().toLowerCase();
    case 'string': {
      if (value instanceof Indexed) {
        return value.hash;
      }

      return value.toString();
    }
    default:
      if (Array.isArray(value)) {
        const singleItemType = inputType.replace('[]', '');

        return value.map(item => transformParsedDataInput(singleItemType, item));
      } else {
        return strip0xPrefix(value.toString());
      }
  }
};

const strip0xPrefix = (data: string) => {
  return data.startsWith('0x') ? data.slice(2) : data;
};

const getFragmentInputName = (input: ParamType, index: number): string => {
  return typeof input.name === 'string' ? input.name : `${input.baseType}_${index + 1}`;
};
