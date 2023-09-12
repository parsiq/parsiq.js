import {TsunamiEventBelongingToCallBase} from "./tsunami-event-belonging-to-call";
import {OpCode} from "../enum/op-code";

export interface DecodedTsunamiEventBelongingToCall extends TsunamiEventBelongingToCallBase {
    op_code?: OpCode;

    decoded: { event: string; [k: string]: any } | null;

    error?: string;
}
