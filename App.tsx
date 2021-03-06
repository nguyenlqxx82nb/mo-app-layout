/**
 * Main Layout
 * Version 1.0
 * NguyenLQ
 *
 */

import React from 'react';

import { CallCenterScreen } from './src/screens/CallCenter';
import { CustomIcon } from 'mo-app-common';
import Root from './src/Root';
import ProfileScreen from './src//screens/Profile';

class App extends React.PureComponent<any, any> {
  constructor(props: any) {
    super(props);
  }

  async componentDidMount() {}

  initMainRoutes = () => {
    return [
      {
        name: 'Marketing',
        key: 'Marketing',
        label: 'Marketing',
        tabBarIcon: (icon: any) => {
          return (<CustomIcon name={'Marketing'} size={16} style={{ color: icon.color }} />);
        },
        loaded: false,
      },
      {
        name: 'Sale',
        key: 'Sale',
        label: 'Sale',
        tabBarIcon: (icon: any) => {
          return (<CustomIcon name={'Sale'} size={16} style={{ color: icon.color }} />);
        },
        loaded: false,
        // notCache: true
      },
      {
        name: 'Social',
        key: 'Social',
        label: 'Mạng xã hội',
        tabBarIcon: (icon: any) => {
          return (<CustomIcon name={'Social'} size={16} style={{ color: icon.color }} />);
        },
        loaded: false,
        screen: null
      },
      {
        name: 'CallCenter',
        key: 'CallCenter',
        label: 'Gọi điện',
        tabBarIcon: (icon: any) => {
          return (<CustomIcon name={'Calling'} size={16} style={{ color: icon.color }} />);
        },
        loaded: false,
        screen: <CallCenterScreen />
      },
      {
        name: 'Profile',
        key: 'Profile',
        label: 'Profile',
        tabBarIcon: (icon: any) => {
          return (<CustomIcon name={'Account'} size={16} style={{ color: icon.color }} />);
        },
        loaded: false,
        screen: <ProfileScreen />
      },
    ];
  }

  render() {
    const routes = this.initMainRoutes();
    return (
      <Root routes={routes} mainTabIndex={3} />
    );
  }
}

export default App;
