import { StyleSheet } from 'react-native';
import { Color, Constants, Device } from 'mo-app-common';

const styles = StyleSheet.create({

  container: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },

  header: {
    paddingHorizontal:16, 
    paddingRight: 8,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Color.border,
    width: Constants.Width,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },

  contentContainer: {
    width: Constants.Width,
    height: Constants.Height - Constants.BarHeight - 50 - 60,
    // paddingBottom: Device.isIphoneX ? 35 + 0 : 0 ,
    zIndex: 20
  },

  filterItem: {
    paddingVertical: 12,
    borderBottomColor: Color.border,
    borderBottomWidth: 1
  },

  filterItemTitle: {
    paddingLeft: 16,
    paddingVertical: 8
  },

  footer: {
    paddingHorizontal: 16,
    paddingVertical: 20,
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingBottom: Device.isIphoneX ? 35 + 20 : 20
  },

  durationDate: {
    paddingLeft: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center'
  }

});

export default styles;
