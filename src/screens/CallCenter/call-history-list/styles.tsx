
import { StyleSheet } from 'react-native';
import { Color, Constants } from 'mo-app-common';

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: '#FFF'
  },

  itemDivider: {
    borderBottomColor: Color.separator,
    borderBottomWidth: 1,
    marginLeft: 42,
    marginRight: 16
  },

  rowItem: {
    width: Constants.Width,
    paddingRight: 16,
    paddingLeft: 16,
    height: 65,
    justifyContent: 'space-between',
    alignItems: 'center',
    flexDirection: 'row'
  },

  searchContainer: {
    paddingHorizontal: 16,
    paddingTop: 12
  },

  filterButton: {
    paddingHorizontal:10,
    height: 32,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center'
  }

});

export default styles;