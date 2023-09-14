import {TsunamiLogBase} from "./tsunami-log";
import {OpCode} from "../../../enum/op-code";

export interface TsunamiDecodedLog extends TsunamiLogBase {
    op_code?: OpCode;

    decoded: { event: string; [k: string]: any } | null;

    error?: string;
}
