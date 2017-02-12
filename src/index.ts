let Service, Characteristic;
import cec = require('cec-promise');
import PowerControl from './controls/Power';
import VolumeControl from './controls/Volume';

interface ICecAccessoryConfig {
  name: string;
  type: string;
  address: number;
};

class CecAccessory {
  log: (msg:string) => void;
  name: string;
  type: string;
  id: string;
  address: number;
  powerService: any;

  constructor(log: (msg:string) => void, config: ICecAccessoryConfig) {
    this.log = log;

    // this.name = config.name;
    this.type = config.type;
    this.name = config.name;
    this.address = config.address;
  }

  identify (callback: () => void) {
    this.log(`Identify`);
    callback();
  }

  getServices () {
    this.log(`Creating accessory service`);
    switch (this.type) {
    case 'power':
      let power = new PowerControl({
        name: this.name,
        address: this.address,
        log: this.log
      });
      let powerService = new Service.Switch(`${this.name}`);
      powerService
        .getCharacteristic(Characteristic.On)
        .on('get', power.getOn.bind(power))
        .on('set', power.setOn.bind(power));
      return [powerService];

    case 'volume':
      let volume = new VolumeControl({
        name: this.name,
        address: this.address,
        log: this.log
      });
      let volumeService = new Service.Switch(`${this.name}`);
      volumeService
        .getCharacteristic(Characteristic.On)
        .on('get', volume.getOn.bind(volume))
        .on('set', volume.setOn.bind(volume));
      return [volumeService];

    default:
      break;
    }
  }

}

export = function (homebridge) {
  Service = homebridge.hap.Service;
  Characteristic = homebridge.hap.Characteristic;
  homebridge.registerAccessory("homebridge-cec", "cec", CecAccessory);
};
