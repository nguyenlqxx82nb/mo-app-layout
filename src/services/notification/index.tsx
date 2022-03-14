export default class PushNotification {

  static getRegistrationToken(callback: (token: string) => void);

  static removeSocialMessageData();

  static getSocialMessageData(callback: (message: string) => void);

  static clear();

  static getDeviceId(callback: (token: string) => void);

  static scheduleExpiredNotification(expiredTime: any);

  static setValue(key: string, value: string);

  static remove(key: string);
}