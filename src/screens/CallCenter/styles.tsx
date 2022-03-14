import { StyleSheet } from 'react-native';
import { Color, Constants } from 'mo-app-common';

const styles = StyleSheet.create({
  searchEmptyContainer: {
    position: 'absolute',
    top: 60,
    left: 0,
    bottom: 0,
    right: 0,
  },
  header: {
    marginTop: Constants.BarHeight, 
    flexDirection: 'row',
    height: 50,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16

  }
});

export default styles;
