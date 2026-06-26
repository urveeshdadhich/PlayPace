export interface HLTBData {
  main_story: number;
  main_extra: number;
  completionist: number;
}

export interface Game {
  appid: number;
  name: string;
  playtime_forever: number;
  cover_url: string;
  hltb: HLTBData;
}

export type BudgetType = 'day' | 'week';

export interface Budget {
  type: BudgetType;
  hours: number;
}
