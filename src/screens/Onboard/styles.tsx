import { StyleSheet } from 'react-native';
import { Constants } from 'mo-app-common';

export default StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        flexDirection: 'column',
    },
    
    slideContainer: {
        width: Constants.Width,
        paddingHorizontal: 15
    },
    slide: {
        alignItems:'center'
    },
    dotStyle:{
        width:10,
        height:10,
        borderRadius: 5,
        marginLeft: 3
    },
    bottomContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        width: Constants.Width,
        paddingHorizontal: 15,
        flexGrow: 1,
    }

});
