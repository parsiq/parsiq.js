import {TsunamiInternalTransactionBase} from "./tsunami-internal-transaction";
import {TsunamiDecodedEventBelongingToCall} from "./tsunami-decoded-event-belonging-to-call";

export interface TsunamiDecodedInternalTransaction extends TsunamiInternalTransactionBase {
    sig_hash?: string;

    input_data?: string;

    decoded: { function: string; [k: string]: any } | null;

    events?: readonly TsunamiDecodedEventBelongingToCall[];

    error?: string;
}
