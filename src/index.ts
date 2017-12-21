let Service, Characteristic;
import cec = require('cec-promise');
import PowerControl, {PowerStatus} from './controls/Power';
import VolumeControl from './controls/Volume';

interface ICecAccessoryConfig {
  name: string;
  type: string;
  address: number;
  timeoutFix?: boolean;
};

class CecAccessory {
  log: (msg:string) => void;
  name: string;
  type: string;
  id: string;
  address: number;
  powerService: any;
  powerTimeoutFix: boolean;

  constructor(log: (msg:string) => void, config: ICecAccessoryConfig) {
    this.log = log;

    // this.name = config.name;
    this.type = config.type;
    this.name = config.name;
    this.address = config.address;
    this.powerTimeoutFix = config.timeoutFix || false;
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
        log: this.log,
        timeoutFix: this.powerTimeoutFix
      });
      const powerService = new Service.Switch(`${this.name}`);
      const characteristic = powerService.getCharacteristic(Characteristic.On);
      characteristic
        .on('get', power.getOn.bind(power))
        .on('set',power.setOn.bind(power));
        power.onReportStatus((status: PowerStatus) => {
          characteristic.setValue(status === PowerStatus.On, null, 'internal');
        });

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
