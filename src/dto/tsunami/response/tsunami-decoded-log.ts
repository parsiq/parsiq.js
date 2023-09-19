import {TsunamiLogBase} from "./tsunami-log";
import {OpCode} from "../../../enum/op-code";
import {TsunamiBasicLogData} from "./tsunami-basic-log-data";

export interface TsunamiDecodedLog extends TsunamiBasicLogData {
    op_code: OpCode;

    decoded: { event: string; [k: string]: any };
}

export interface TsunamiDecodingErrorLog extends TsunamiLogBase {
    op_code: OpCode;

    error: string;

    decoded: null; //TODO: it confirms to what we do in Tsunami, but it is really useless
}
