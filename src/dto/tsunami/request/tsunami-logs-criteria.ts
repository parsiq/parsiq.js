import { BasicTsunamiDataCriteria } from './basic-tsunami-data-criteria';
import { OpCode } from '../../../enum/op-code';

export interface TsunamiLogsCriteria extends BasicTsunamiDataCriteria {
  topic_0?: string[];
  topic_1?: string[];
  topic_2?: string[];
  topic_3?: string[];
  op_code?: OpCode;
}
