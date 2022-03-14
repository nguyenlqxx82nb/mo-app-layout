import { NativeModules } from 'react-native';
import createError from './createError';

const { MoFingerprint } = NativeModules;

export default ({ description = ' ', fallbackEnabled = true }) => {
  return new Promise((resolve, reject) => {
    MoFingerprint.authenticate(description, fallbackEnabled, error => {
      if (error) {
        return reject(createError(error.code, error.message))
      }

      return resolve(true);
    });
  });
}
