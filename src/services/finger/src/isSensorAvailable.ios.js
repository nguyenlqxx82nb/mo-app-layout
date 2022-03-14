import { NativeModules } from 'react-native';
import createError from './createError';

const { MoFingerprint } = NativeModules;

export default () => {
  return new Promise((resolve, reject) => {
    MoFingerprint.isSensorAvailable((error, biometryType) => {
      if (error) return reject(createError(error.code, error.message));
      resolve(biometryType);
    });
  });
}
