import React from 'react';
import { View, TouchableOpacity, DeviceEventEmitter, Linking, EmitterSubscription, Keyboard } from 'react-native';
import { WrapText, FormInput, ListView, AsyncImage, Router, WrapButton, Tab } from 'mo-app-comp';
import { Color, CustomIcon, Styles, Constants, Utils, EmitKeys, toast } from 'mo-app-common';
import UserStatusSelect from './status';
import CustomerService from '../../services/CustomerService';
import PhoneDetailInfoScreen from './detail';

import CustomerList from './customer-list';
import CallHistoryList from './call-history-list';
import styles from './styles';

export interface IProfileItem {
  id: string;
  avatar: string;
  name: string;
  phone_number: string;
  secondary_phones?: any[],
  email: string;
  showInfo?: boolean;
  encrypt?: any;
}

interface ICallCenterScreenState {
  isConnected: boolean;
  isSearchEmpty: boolean;
  callEnable: boolean;
}

export default class CallCenterScreen extends React.PureComponent<any, ICallCenterScreenState> {

  lwRef: ListView;
  searchInputRef: FormInput;
  searchValue: string = '';
  token: string = '';
  connectedSubscription: EmitterSubscription;
  currentItem: IProfileItem;
  currPhone: string;
  tabData: any[];

  cusRef: CustomerList;

  constructor(props: any) {
    super(props);
    this.state = {
      isConnected: true,
      isSearchEmpty: true,
      callEnable: false
    };
    this.connectedSubscription = DeviceEventEmitter.addListener(EmitKeys.CALL_CENTER_DID_CONNECTED, this.onConnectHandler);

    this.tabData = [
      {
        name: 'Khách hàng',
        content: <CustomerList ref={(comp) => { this.cusRef = comp; }} />
      },
      {
        name: 'Lịch sử',
        content: <CallHistoryList />
      }
    ];
  }

  componentDidMount() { }

  onConnectHandler = () => {
  }

  render() {
    const { isSearchEmpty, callEnable } = this.state;
    return (
      <View style={{ flex: 1, backgroundColor: Color.background }}>

        <TouchableOpacity style={[styles.header]} 
          activeOpacity={1}
          onPress={()=>{ Keyboard.dismiss();}}>
          <WrapText st={Styles.Text_XL_B}>{'Tổng đài'}</WrapText>
          <UserStatusSelect />
        </TouchableOpacity>

        <View style={[Styles.FlexGrow, {paddingTop: 0}]}>
          <Tab tabInfo={this.tabData} tabWidth={Constants.Width - 32} />
        </View>
      </View>
    );
  }
}

