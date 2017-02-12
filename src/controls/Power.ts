const cec = require('cec-promise');
import Control, {IControlConfig} from './Control';

export default class PowerControl extends Control {

  constructor (config: IControlConfig) {
    super(config);
  }

  getOn(callback: (error: Error, value?: number) => void) {
    this.log(`getOn: ${this.addressByte}`);
    cec.request(this.addressByte, 'GIVE_DEVICE_POWER_STATUS', 'REPORT_POWER_STATUS')
    .then((res) => {
      var on = (res.status === 0) ? 1 : 0;
      this.log(`${this.name} getOn: ${on}`);
      return callback(null, on);
    })
    .catch((err) => {
      this.log(err);
      return callback(err);
    });
  }

  setOn(on: number, callback: (err: Error) => void) {
    this.getOn((err, isOn) => {
      if (err !== null) {
        this.log(err);
        callback(err);
      } else {
        if (on === isOn) {
          this.log(`${this.name} setOn: already ${on ? 'on' : 'off'}`);
        } else {
          let newMode = isOn ? 'standby' : 'on';
          this.log(`${this.name} setOn: ${on}`);
          cec.send(`${newMode} ${this.controlNibble}`);
        }
        callback(null);
      }
    });
  }

}
