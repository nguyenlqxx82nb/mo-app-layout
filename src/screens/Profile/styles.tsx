import { StyleSheet } from 'react-native';
import { Color, Constants } from 'mo-app-common';

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: Color.background
	},
	containerBottom: {
		borderTopLeftRadius: 20,
		borderTopRightRadius: 20,
		borderWidth: 0,
		flexGrow: 1,
		paddingTop: 20,
		paddingBottom: 10,
		flex: 1,
		width: Constants.Width,
		borderBottomWidth: 0
	}
});

export default styles;
