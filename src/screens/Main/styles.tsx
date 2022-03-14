import { StyleSheet } from 'react-native';
import { Color } from 'mo-app-common';
export default StyleSheet.create({ 

    container: {
        flex: 1,
        backgroundColor: Color.background
    },

    innerContainer: {
        flex: 1,
        flexGrow: 1,
        position: 'relative'
    },

    fill: {
        position: 'absolute',
        top:0,
        left:0,
        bottom:0,
        right:0
    }
});
