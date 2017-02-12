const cec = require('cec-promise');
import Control, {IControlConfig, IAccessoryCallback} from './Control';

export default class VolumeControl extends Control {

  constructor (config: IControlConfig) {
    super(config);
  }

  getOn (callback: IAccessoryCallback) {
    this.getMute((err, mute) => {
      callback(err, (mute === 1) ? 0 : 1);
    });
  }

  setOn (on: number, callback: IAccessoryCallback) {
    this.setMute((on === 1) ? 0 : 1, (err) => {
      callback(err);
    });
  }

  private getMute (callback: IAccessoryCallback) {
    cec.request(this.addressByte, 'GIVE_AUDIO_STATUS', 'REPORT_AUDIO_STATUS')
    .then((res) => {
      var mute = (0x80 & res.status) === 0 ? 0 : 1;
      this.log(`${this.name} getMute: ${mute}`);
      return callback(null, mute);
    })
    .catch((err: Error) => {
      this.log(err);
      return callback(err);
    });
  }

  private setMute (mute: number, callback: IAccessoryCallback) {
    cec.request(this.addressByte, 'GIVE_AUDIO_STATUS', 'REPORT_AUDIO_STATUS')
    .then((res) => {
      var currentMute = (0x80 & res.status) === 0 ? 0 : 1;
      if (currentMute === mute) {
        this.log(`${this.name} setMute: already ${mute}`);
      } else {
        cec.send('mute');
        this.log(`${this.name} setMute: ${currentMute} -> ${mute}`);
      }
      return callback(null);
    })
    .catch((err: Error) => {
      return callback(err);
    });
  }
}
