import {TsunamiLogWithingInternalTransactionBase} from "./tsunami-log-within-internal-transaction";
import {OpCode} from "../../../enum/op-code";

export interface TsunamiDecodedEventBelongingToCall extends TsunamiLogWithingInternalTransactionBase {
    op_code?: OpCode;

    decoded: { event: string; [k: string]: any } | null;

    error?: string;
}
