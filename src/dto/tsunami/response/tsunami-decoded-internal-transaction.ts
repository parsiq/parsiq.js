import {TsunamiInternalTransactionBase} from "./tsunami-internal-transaction";
import {TsunamiDecodedLogBelongingToInternalTransaction} from "./tsunami-decoded-log-belonging-to-internal-transaction";

export interface TsunamiDecodedInternalTransaction extends TsunamiInternalTransactionBase {
    decoded: { function: string; [k: string]: any };

    events?: readonly TsunamiDecodedLogBelongingToInternalTransaction[];
}

export interface TsunamiDecodingErrorInternalTransaction extends TsunamiInternalTransactionBase {
    sig_hash: string;

    input_data: string;

    events?: readonly TsunamiDecodedLogBelongingToInternalTransaction[];

    error: string;

    decoded: null; //TODO: it confirms to what we do in Tsunami, but it is really useless
}
