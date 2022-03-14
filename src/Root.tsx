/**
 * Main Layout
 * Version 1.0
 * NguyenLQ
 *
 */

import React from 'react';
import { View } from 'react-native';
import AppMain from './AppMain';
import {JwtHelper, Constants} from 'mo-app-common';
import CommonLanguage from 'mo-app-common/src/Common/Languages';
import Utils from 'mo-app-common/src/Common/Utils';

class Root extends React.PureComponent<any,any> {

  constructor(props: any) {
    super(props);
    this.state = {
      loaded: false
    };
  }

  initGlobalData = async () => {
    CommonLanguage.setLanguage('vi');
    await Utils.initGlobalData();
    if (Constants.AuthToken) {
      console.log('AuthToken=', Constants.AuthToken, '-userInfo=',Constants.UserId, Constants.MerchantId);
    }
    
    this.setState({
      loaded: true
    });
  }

  async componentDidMount() {
    setTimeout(() => {
      this.initGlobalData();
    }, 0);
  }

  render() {
    const { loaded } = this.state;
    if (!loaded) {
      return (
        <View style={{flex: 1}} />
      );
    }
    return (
      <AppMain {...this.props} />
    );
  }
}

export default Root;
