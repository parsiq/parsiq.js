import {TsunamiCallBase} from "./tsunami-call";
import {DecodedTsunamiEventBelongingToCall} from "./decoded-tsunami-event-belonging-to-call";

export interface DecodedTsunamiCall extends TsunamiCallBase {
    sig_hash?: string;

    input_data?: string;

    decoded: { function: string; [k: string]: any } | null;

    events?: readonly DecodedTsunamiEventBelongingToCall[];

    error?: string;
}
