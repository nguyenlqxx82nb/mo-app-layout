import { StyleSheet } from 'react-native';
import { Color, Constants, Device } from 'mo-app-common';

export default StyleSheet.create({
  
  contentContainer: {
    flexGrow: 1, 
    height: Constants.Height * 2 / 3, 
    backgroundColor: Color.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    marginTop: -30
  },

  headerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: Constants.BarHeight,
    height: Constants.Height / 3 + 30,
    backgroundColor: 'rgb(242,244,248)'
  },

  logoImg: {
    width: Constants.Width - 43 * 2, 
    height: (Constants.Width - 43 * 2) * 144/622, 
    marginTop: -30
  },

  bottomContainer: {
    position: 'absolute',
    bottom: Device.isIphoneX ? 70 : Constants.Height > 700 ? 35 : 10,
    left: 0,
    right: 0,
    alignItems: 'center'
  }
});
