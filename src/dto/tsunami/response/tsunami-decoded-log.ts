import {TsunamiLogBase} from "./tsunami-log";
import {OpCode} from "../../../enum/op-code";
import {TsunamiBasicLogData} from "./tsunami-basic-log-data";

export interface TsunamiDecodedLog extends TsunamiBasicLogData {
    op_code: OpCode;

    decoded: { event: string; [k: string]: any } | null;
}

export interface TsunamiDecodingErrorLog extends TsunamiLogBase {
    op_code: OpCode;

    error: string;
}
