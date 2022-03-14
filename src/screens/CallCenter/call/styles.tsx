import { Color, Constants, Device } from 'mo-app-common';
import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    backgroundColor: Color.gray,
    position: 'absolute',
    top: 0,
    bottom: 0,
    right: 0,
    left: 0
  },
  buttonIcon: {
    width: 57,
    height: 57,
    borderRadius: 30,
    backgroundColor: Color.border,
    justifyContent: 'center',
    alignItems: 'center'
  },

  bottomControlContainer: {
    position:'absolute',
    bottom: Device.isIphoneX ? 30 + 50 : 50,
    paddingHorizontal: 80,
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: Constants.Width
  },

  buttonCall: {
    width: 57,
    height: 57,
    borderRadius: 30,
    backgroundColor: Color.green,
    justifyContent: 'center',
    alignItems: 'center'
  },

  buttonDismissCall: {
    width: 57,
    height: 57,
    borderRadius: 30,
    backgroundColor: Color.red,
    justifyContent: 'center',
    alignItems: 'center'
  }
});

export default styles;

