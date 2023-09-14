interface TsunamiContractCreationsDestructionsByOrigin {
  origin: string;
}

interface TsunamiContractCreationsDestructionsByCaller {
  caller: string;
}

interface TsunamiContractCreationsDestructionsByContract {
  contract: string[];
}

export type TsunamiContractCreationsDestructionsCriteriaBase =
  | TsunamiContractCreationsDestructionsByCaller
  | TsunamiContractCreationsDestructionsByOrigin
  | TsunamiContractCreationsDestructionsByContract;
