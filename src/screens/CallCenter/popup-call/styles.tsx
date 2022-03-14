import { Color, Constants } from 'mo-app-common';
import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    height: 122,
    width: Constants.Width - 32,
    marginHorizontal: 16,
    backgroundColor: '#fff',
    borderRadius: 5
  },
  header: {
    backgroundColor: Color.primary,
    height: 30.5,
    width: '100%',
    paddingLeft: 20,
    borderTopLeftRadius: 5,
    borderTopRightRadius: 5,
  },
  contentContainer: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 12
  }
});

export default styles;