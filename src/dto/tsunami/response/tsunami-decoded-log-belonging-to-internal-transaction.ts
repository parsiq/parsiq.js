import {TsunamiLogWithingInternalTransactionBase} from "./tsunami-log-within-internal-transaction";
import {OpCode} from "../../../enum/op-code";

export interface TsunamiDecodedLogBelongingToInternalTransaction {
    op_code: OpCode;

    contract: string;

    decoded: { event: string; [k: string]: any } | null;
}

export interface TsunamiDecodingErrorLogBelongingToInternalTransaction extends TsunamiLogWithingInternalTransactionBase {
    op_code: OpCode;

    error: string;
}
