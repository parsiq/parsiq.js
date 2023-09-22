import { OpCode } from '../../../enum/op-code';

export interface TsunamiDecodedLogBelongingToInternalTransaction {
  op_code: OpCode;
  contract: string;
  decoded: { event: string; [k: string]: any };
}

export interface TsunamiDecodingErrorLogBelongingToInternalTransaction {
  op_code: OpCode;
  topic_0: string;
  topic_1: string;
  topic_2: string;
  topic_3: string;
  log_data: string;
  contract: string;
  error: string;
  decoded: null; //TODO: it confirms to what we do in Tsunami, but it is really useless
}
