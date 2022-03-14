import { StyleSheet } from 'react-native';
import { Color, Constants } from 'mo-app-common';

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: '#fff'
  },

  itemDivider: {
    borderBottomColor: Color.separator,
    borderBottomWidth: 1,
    marginLeft: 64,
    marginRight: 16
  },

  rowItem: {
    width: Constants.Width,
    paddingRight: 12,
    paddingLeft: 16,
    height: 60,
    justifyContent: 'space-between',
    alignItems: 'center',
    flexDirection: 'row'
  },

  callPhone: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0, 156, 219, 0.1)',
    justifyContent: 'center',
    alignItems: 'center'
  }

});

export default styles;