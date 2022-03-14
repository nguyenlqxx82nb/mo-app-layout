import { DeviceEventEmitter, NativeModules, Platform } from 'react-native';

const { MoFingerprint } = NativeModules;

export default () => {
  if (Platform.Version < 23) {
    DeviceEventEmitter.removeAllListeners('FINGERPRINT_SCANNER_AUTHENTICATION');
  }

  MoFingerprint.release();
}
