export interface IArkCommandEntry {
  order: number;
  command: string;
}

class ArkCommands {
  constructor(public list: Array<IArkCommandEntry>) {}
}

export default ArkCommands;
