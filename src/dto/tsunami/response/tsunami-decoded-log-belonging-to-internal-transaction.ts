import {TsunamiLogWithingInternalTransactionBase} from "./tsunami-log-within-internal-transaction";
import {OpCode} from "../../../enum/op-code";

export interface TsunamiDecodedLogBelongingToInternalTransaction {
    op_code: OpCode;

    contract: string;

    decoded: { event: string; [k: string]: any };
}

export interface TsunamiDecodingErrorLogBelongingToInternalTransaction extends TsunamiLogWithingInternalTransactionBase {
    op_code: OpCode;

    error: string;

    decoded: null; //TODO: it confirms to what we do in Tsunami, but it is really useless
}
