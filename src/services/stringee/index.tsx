export default class MoCallCenter {

  static initAndConnect(token: string);

  static makeCall(from: string, to: string);

  static setValue(key: string, value: string);

  static remove(key: string);

  static clear();

  static updateCurrModule(currModule: string);
}