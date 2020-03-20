export interface VocabRoll {
  [index: number]: number;
  vocabId: number;
  correct?: boolean;
  type?: ContainerType;
}

export enum BarrierType {
  VANILLA,
  ALL_WRONG,
  JOKER,
}

export const BarrierTypes = {
  vanilla: BarrierType.VANILLA,
  allwrong: BarrierType.ALL_WRONG,
  joker: BarrierType.JOKER,
};

export enum ContainerType {
  VANILLA,
  ALL_WRONG,
  JOKER,
}
