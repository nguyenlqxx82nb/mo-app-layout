import { Constants } from 'mo-app-common';
import { StyleSheet } from 'react-native';
import { Color } from 'mo-app-common';

const styles = StyleSheet.create({
	container: {
		backgroundColor: '#fff',
		width: Constants.Width,
		height: 500,
		borderTopLeftRadius: 20,
		borderTopRightRadius: 20,
		position: 'absolute',
		bottom: 0,
		left: 0
	},

	header: {
		width: Constants.Width,
		height: 106,
		justifyContent: 'center',
		alignItems: 'center',
		borderBottomColor: Color.border,
		borderBottomWidth: 0.5,
		position: 'relative'
	},

	closeButton: {
		width: 40,
		height: 40,
		position: 'absolute',
		top: 10,
		right: 10
	},

	bodyContainer: {
		flexGrow: 1
	}
});

export default styles;
