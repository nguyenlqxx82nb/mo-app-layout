import { StyleSheet } from 'react-native';
import { Constants, Color } from 'mo-app-common';

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: Color.gray3
  },

  header: {
    marginTop: Constants.BarHeight,
    height: 50,
    width: Constants.Width,
    alignItems: 'center',
    flexDirection: 'row',
    paddingHorizontal: 5
  },

  workItem: {
    borderRadius: 8,
    backgroundColor: '#fff',
    height: 52,
    width: (Constants.Width - 16*5) / 4,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 4
  },

  shadow: {
    shadowColor: '#4e4e4e',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2.22,

    elevation: 3,
    zIndex: -1
  },

  otherContact: {
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingVertical: 12,
  },

  otherContactItem: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 45,
    height: 45
  },

  callHisContainer: {
    borderRadius: 8,
    backgroundColor: '#fff',
    marginTop: 12,
    marginBottom: 20,
    flexGrow: 1
  },

  rowItem: {
    flexDirection: 'row',
    width: Constants.Width - 32,
    alignItems: 'center'
  },

  rowItemLeft: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 40,
  },

  rowItemRight: {
    width: Constants.Width - 32 - 56,
    justifyContent: 'space-between',
    flexDirection: 'row',
    // paddingRight: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Color.separator
  }


});

export default styles;
