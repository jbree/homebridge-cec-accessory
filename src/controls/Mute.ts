const cec = require('cec-promise');
import Control, {IControlConfig} from './Control';

export default class MuteControl extends Control {

  constructor (config: IControlConfig) {
    super(config);
  }

  getMute(callback) {
    cec.request(this.addressByte, 'GIVE_AUDIO_STATUS', 'REPORT_AUDIO_STATUS')
    .then((res) => {
      var mute = (0x80 & res.status) === 0 ? 0 : 1;
      console.log(`${this.name} getMute: ${mute}`);
      return callback(null, mute);
    })
    .catch(function (err) {
      console.log(err);
      return callback(err);
    });
  }

  setMute(mute, callback) {
    cec.request(this.addressByte, 'GIVE_AUDIO_STATUS', 'REPORT_AUDIO_STATUS')
    .then((res) => {
      var currentMute = (0x80 & res.status) === 0 ? 0 : 1;
      if (currentMute === mute) {
        console.log(`${this.name} setMute: already ${mute}`);
      } else {
        cec.send('mute');
        console.log(`${this.name} setMute: ${currentMute} -> ${mute}`);
      }
      return callback(null);
    })
    .catch(function (err) {
      return callback(err);
    });
  }
}
