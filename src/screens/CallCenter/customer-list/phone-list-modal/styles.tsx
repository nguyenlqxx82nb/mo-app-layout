import { StyleSheet } from 'react-native';
import { Constants, Color } from 'mo-app-common';

const styles = StyleSheet.create({

  container: {
    width: Constants.Width,
    height: 'auto',
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20
  },

  rowSelectedHeader: {
    backgroundColor: 'rgba(0,156,219,0.2)',
    paddingLeft: 16,
    paddingRight: 8,
    paddingVertical: 4,
    height: 30,
    width: Constants.Width,
    justifyContent: 'space-between',
    flexDirection: 'row',
    alignItems: 'center'
  },

  rowSelectedBody: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 4,
    justifyContent: 'center',
    alignItems: 'center',
    width: Constants.Width
  },

  rowSelectedDivider: {
    marginHorizontal: 15,
    height: 30,
    width: 1,
    backgroundColor: Color.gray
  },

  rowItem: {
    paddingLeft: 16,
    paddingRight: 8,
    paddingVertical: 4,
    height: 30,
    width: Constants.Width,
    justifyContent: 'space-between',
    flexDirection: 'row',
    alignItems: 'center'
  }

});

export default styles;