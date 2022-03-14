import { NativeModules } from 'react-native';
import createError from './createError';

const { MoFingerprint } = NativeModules;

export default () => {
  return new Promise((resolve, reject) => {
    MoFingerprint.isSensorAvailable()
      .then((biometryType) => resolve(biometryType))
      .catch(error => reject(createError(error.code, error.message)));
  });
}
