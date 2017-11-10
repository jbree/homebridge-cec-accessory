const cec = require('cec-promise');
import Control, {IControlConfig, IControlReport} from './Control';

export enum PowerStatus {
  On = 'on',
  Standby = 'standby',
  Unknown = 'unknown',
};

export default class PowerControl extends Control {

  constructor (config: IControlConfig) {
    super(config);
  }

  getOn(callback: (error: Error, value?: number) => void) {
    this.log(`getOn: ${this.addressByte}`);
    cec.request(this.addressByte, 'GIVE_DEVICE_POWER_STATUS', 'REPORT_POWER_STATUS')
    .then((res) => {
      var on = res.status ? 0 : 1;
      this.log(`${this.name} getOn: ${on}`);
      return callback(null, on);
    })
    .catch((err) => {
      this.log(err);
      return callback(err);
    });
  }

  setOn(on: number, callback: (err: Error) => void, context) {
    if (context === 'internal') {
      callback(null);
      return;
    }
    this.getOn((err, isOn) => {
      if (err !== null) {
        this.log(err);
        callback(err);
      } else {
        if (on == isOn) {
          this.log(`${this.name} setOn: already ${on ? 'on' : 'off'}`);
        } else {
          let newMode = on ? 'on' : 'standby';
          this.log(`${this.name} setOn: ${on}`);
          cec.send(`${newMode} ${this.controlNibble}`);
        }
        callback(null);
      }
    });
  }

  onReportStatus(callback: (status: PowerStatus) => void) {
    cec.on('REPORT_POWER_STATUS', (status: IControlReport) => {
      if (Number(status.source) === this.controlNibble) {
        const powerStatus = (() => {
          switch (status.args[0]) {
            case cec.code.PowerStatus.ON: return PowerStatus.On;
            case cec.code.PowerStatus.STANDBY: return PowerStatus.Standby;
            default: return PowerStatus.Unknown;
          }
        })();
        this.log(`${this.name} reportStatus: ${powerStatus}`);
        callback(powerStatus);
      }
    });
  }

}
