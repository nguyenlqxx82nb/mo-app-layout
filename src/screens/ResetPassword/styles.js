/** @format */

import { Dimensions, StyleSheet, I18nManager } from 'react-native';
import { Color, Styles, Constants, Device } from '@common';

const { width, height } = Dimensions.get('window');
// const marginLeft = Constants.TextSize === 1 ? (width < 375 ? width * 0.085 : width * 0.125) : (width < 375 ? width * 0.065 : width * 0.1);
export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.0,
    elevation: 3,
  },

  contentContainer:{
    flex:1,
    paddingTop: Constants.HeaderHeight
  },

  subContain: {
    paddingHorizontal: Device.Left,
    paddingBottom: 50,
  },

  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: Color.blackDivide,
    borderBottomWidth: 1,
    marginTop:30
  },

  input: (text) => ({
    color: 'rgba(65,75,89)',
    //borderColor: Color.blackDivide,
    height: 40,
    marginTop: 0,
    marginLeft: 0,
    paddingHorizontal: 0,
    paddingTop: 0,
    paddingBottom: 0,
    flex: 1,
    textAlign: I18nManager.isRTL ? 'right' : 'left',
    fontFamily:Constants.fontRegular
  }),

  text : {
    color: 'rgba(65,75,89,0.5)',
    textAlign: 'center',
    paddingTop: 20,
    fontFamily:Constants.fontRegular
  },

  noteText:{
    color:'rgb(65,75,89)',
    fontFamily:Constants.fontRegular,
    fontSize:14,
    lineHeight:18,
  },

  termText: {
    fontFamily:Constants.fontRegular,
    fontSize:14,
    lineHeight:18,
    textDecorationLine:'underline'
  },
  
  signUp: {
    color:'rgb(65,75,89)' ,//Color.blackTextSecondary,
    marginTop: 20,
    fontFamily:Constants.fontRegular
  },
  highlight: {
    fontWeight: 'bold',
    color: 'rgb(37,48,92)',//Color.primary,
    fontFamily:Constants.fontMedium
  },
  overlayLoading: {
    ...StyleSheet.absoluteFillObject,
    width,
    height,
  },
});
