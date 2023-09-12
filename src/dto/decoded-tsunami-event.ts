import {TsunamiEventBase} from "./tsunami-event";
import {OpCode} from "../enum/op-code";

export interface DecodedTsunamiEvent extends TsunamiEventBase {
    op_code?: OpCode;

    decoded: { event: string; [k: string]: any } | null;

    error?: string;
}
