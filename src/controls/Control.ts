export interface IControlConfig {
  name: string;
  address: number;
  log?: (msg:any) => void;
};

export interface IAccessoryCallback {
  (err: Error, value?: number): void;
};

export default class Control {

  name: string;
  log: (msg:any) => void;
  addressByte: number;
  senderNibble: number;
  controlNibble: number;

  constructor (config: IControlConfig) {
    this.name = config.name;
    this.log = config.log || console.log;
    this.controlNibble = config.address;
    this.senderNibble = 14;

    this.addressByte = ((this.senderNibble % 16) << 4) | (this.controlNibble % 16);
  }

}
