import React from 'react';
import { View, Platform, PermissionsAndroid, DeviceEventEmitter, EmitterSubscription, Keyboard, AppState, NativeEventEmitter, NativeModules } from 'react-native';
import { IUserInfo, JwtHelper, Utils, EmitKeys, Storage, StringeeKeys , StringeeService, Constants, CommonLanguage } from 'mo-app-common';
import CallCenterConfigService from './CallCenterConfig';
import MoCallCenter from '../stringee';
import { each } from 'underscore';
import { Router, ScreenType,  } from 'mo-app-comp';
import  PhoneDetail from '../../screens/CallCenter/detail';
// import jwt_decode from 'jwt-decode';

class CallCenterManager extends React.PureComponent<any, any> {

  accessToken: string;
  phoneNumber: string;
  extension: string;
  accessAgentToken: string;
  openProfile: boolean;
  profile: any;
  toNumber: string;

  clientEventHandlers: any;
  callEventHandlers: any;

  // subscription
  makeCallSubscription: EmitterSubscription;

  // strinee event subs
  stringeeConnectedSub: EmitterSubscription;
  stringeeDisConnectedSub: EmitterSubscription;
  // stringeeErrorConnectedSub: EmitterSubscription;
  // stringeeIncomingCallSub: EmitterSubscription;
  // stringeeSignalingStateSub: EmitterSubscription;
  // stringeeMediaStateSub: EmitterSubscription;
  // stringeeAnotherDevice: EmitterSubscription;
  stringeeEndCall: EmitterSubscription;
  stringeeMakeCall: EmitterSubscription;

  incomingCallIds: string[] = [];
  constructor(props: any) {
    super(props);

    this.callEventHandlers = {
      onChangeSignalingState: this._callDidChangeSignalingState,
      onChangeMediaState: this._callDidChangeMediaState,
      onHandleOnAnotherDevice: this._didHandleOnAnotherDevice,
    };

    this.makeCallSubscription = DeviceEventEmitter.addListener(EmitKeys.CALL_CENTER_MAKE_CALL, this.onMakeCallHandler);

    // stringee events
    const eventCallCenterEmitter = new NativeEventEmitter(NativeModules.MoCallCenter);
    this.stringeeConnectedSub = eventCallCenterEmitter.addListener('onStringeeDidConnected', this._clientDidConnect);
    this.stringeeDisConnectedSub = eventCallCenterEmitter.addListener('onStringeeDisConnected', this._clientDidDisConnect);
    this.stringeeEndCall = eventCallCenterEmitter.addListener('onStringeeEndCall', this._didEndCallHandler);
    this.stringeeMakeCall = eventCallCenterEmitter.addListener('onStringeeDidMakeCall', this._didMakeCallHandler);
  }

  componentDidMount() {
    AppState.addEventListener('change', this._handleAppStateChange);
  }

  componentWillUnmount() {
    this.makeCallSubscription.remove();

    this.stringeeConnectedSub.remove();
    this.stringeeDisConnectedSub.remove();
    this.stringeeMakeCall.remove();
    this.stringeeEndCall.remove();

    AppState.removeEventListener('change', this._handleAppStateChange);
  }

  init = async () => {
    console.log('init call center');
    const hasPermission = await this.checkPermission();
    if (!hasPermission) {
      return;
    }
    const hasAccessToken = await this.getCallAccessToken();
    if (hasAccessToken) {
      MoCallCenter.setValue('ACCESS_TOKEN', this.accessToken);
      MoCallCenter.setValue('PHONE_NUMBER', this.phoneNumber);
      // console.log('accessToken '+ this.accessToken + " PHONE_NUMBER = "+this.phoneNumber);
    } else {
      MoCallCenter.remove('ACCESS_TOKEN');
    }

    if (!hasAccessToken) {
      return;
    }
    const hasAgentAccessToken = await this.getAgentAccessToken();
    if (!hasAgentAccessToken) {
      return;
    }
    MoCallCenter.setValue('ACCESS_AGENT_TOKEN', this.accessAgentToken);

    // get configs
    const config = await CallCenterConfigService.getConfigs();
    if (config) {
      MoCallCenter.setValue('RING_TONE', config.link_ringtone);
    }

    MoCallCenter.initAndConnect(this.accessToken);
    if (Platform.OS === 'android') {
      this.requestPermission();
    }
    this.getAgentStatus();
  }

  getAgentStatus = async () => {
    const agent = await StringeeService.getCurrentAgent();
    console.log('getAgentStatus agent ', agent);
    if (agent) {
      Constants.CALL_STATUS = agent.manual_status;
      DeviceEventEmitter.emit(EmitKeys.CALL_CENTER_STATUS_CHANGE, agent.manual_status);
    }
  }

  _clientDidConnect = ({ userId }) => {
    console.log('_clientDidConnect ', userId);
    Constants.IsCallCenterConnected = true;
    DeviceEventEmitter.emit(EmitKeys.CALL_CENTER_DID_CONNECTED, userId);
  }

  _clientDidDisConnect = () => {
    // toast('Mất kết nối tổng đài');
    console.log('_clientDidDisConnect ');
    DeviceEventEmitter.emit(EmitKeys.CALL_CENTER_DID_DIS_CONNECTED);
  };

  // The client fails to connects to Stringee server
  _clientDidFailWithError = (error) => {
    console.log('_clientDidFailWithError ', error);
  };

  // Access token is expired. A new access token is required to connect to Stringee server
  _clientRequestAccessToken = () => {
    console.log('_clientRequestAccessToken');
    // this.refs.client.connect('NEW_YOUR_ACCESS_TOKEN');
  };

  // IncomingCall event
  _callIncomingCall = async ({ callId, from, to, fromAlias, toAlias, callType, customDataFromYourServer }) => {
    console.log('IncomingCallId- App state ' + AppState.currentState + ' callId - ' + callId + ' from-' + from + ' to-' + to + ' fromAlias-' + fromAlias + ' toAlias-' + toAlias + 'callType-' + callType + 'customDataFromYourServer-' + customDataFromYourServer);
    if (!Constants.AuthToken || !this.accessToken ) {
      return;
    }
    if (AppState.currentState !== 'active') {
      return;
    }
  }

  /// MARK: - CALL EVENT HANDLER
  // Invoked when the call signaling state changes
  _callDidChangeSignalingState = ({ callId, code }) => {
    console.log('_callDidChangeSignalingState ' + ' callId-' + callId + 'code-' + code);
  };

  // Invoked when the call media state changes
  _callDidChangeMediaState = ({ callId, code }) => {
    console.log('_callDidChangeMediaState' + ' callId-' + callId + 'code-' + code );
    switch (code) {
      case 0:
        this.setState({ callState: 'Started' });
        break;
      case 1:
        break;
    }
  };
  // Invoked when the call is handled on another device
  _didHandleOnAnotherDevice = ({ callId, code }) => {
  };

  _didEndCallHandler = ({callId, time, phoneNumber}) => {
    console.log('_didEndCallHandler ' + callId + '***' + time, ' phoneNumber=',phoneNumber, ' isCall=', Constants.IsInCall);
    const _phoneNumber = Constants.IsInCall ? this.toNumber : phoneNumber;

    Router.replaceFrom(
      <PhoneDetail
        callDurationTime={time}
        callId={callId}
        endCallStatus={true}
        phoneNumber={_phoneNumber} />, {screenType: ScreenType.CALL_DETAIL, action: 'replaceFrom'});

    setTimeout(() => {
      Constants.IsInCall = false;
    }, 0);

    Keyboard.dismiss();
  }

  endCall = (callId: string) => {
    // MoStringee.stopRingtone();
    setTimeout(() => {
      DeviceEventEmitter.emit(EmitKeys.CALL_CENTER_END_CALL, callId, true);
    }, 500);
    Constants.IsInCall = false;
  }

  requestPermission = () => {
    return new Promise((resolve, reject) => {
      PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
      ])
        .then(result => {
          const permissionsError: any = {};
          permissionsError.permissionsDenied = [];
          each(result, (permissionValue, permissionType) => {
            if (permissionValue === 'denied') {
              permissionsError.permissionsDenied.push(permissionType);
              permissionsError.type = 'Permissions error';
            }
          });
          if (permissionsError.permissionsDenied.length > 0) {
            reject(permissionsError);
          } else {
            resolve([]);
          }
        })
        .catch(error => {
          reject(error);
        });
    });
  }

  private checkPermission = async () => {
    const userInfo: IUserInfo = await JwtHelper.decodeToken();
    if (!userInfo.statusUseCallCenter || userInfo.statusUseCallCenter !== 3) {
      return false;
    }
    return true;
  }

  private getCallAccessToken = async () => {
    const responseGetAccessTokenClient = await CallCenterConfigService.getAccessToken({ 'type': 1 });
    if (!responseGetAccessTokenClient || !responseGetAccessTokenClient.token || !responseGetAccessTokenClient.pbxnumber) {
      this.accessToken = undefined;
      return false;
    }

    this.accessToken = responseGetAccessTokenClient.token;
    this.phoneNumber = responseGetAccessTokenClient.pbxnumber;
    this.extension = responseGetAccessTokenClient.extension;

    Storage.setItem(StringeeKeys.KEY_ACCESS_TOKEN, this.accessToken);
    Storage.setItem(StringeeKeys.KEY_AGENT_EXTENSION, this.extension);

    return true;
  }

  private getAgentAccessToken = async () => {
    const responseGetAccessTokenClient = await CallCenterConfigService.getAccessToken({ 'type': 2 });
    if (!responseGetAccessTokenClient || !responseGetAccessTokenClient.token || !responseGetAccessTokenClient.pbxnumber) {
      return false;
    }
    this.accessAgentToken = responseGetAccessTokenClient.token;
    Storage.setItem(StringeeKeys.KEY_AGENT_ACCESS_TOKEN, this.accessAgentToken);
    return true;
  }

  onMakeCallHandler = (toNumber: string, profile: any, openProfile?: boolean) => {
    if (Constants.IsInCall) {
      return;
    }
    Constants.IsInCall = true;
    this.callToPhone(toNumber, profile, openProfile);
  }

  /**
   * call to phone
   * @param toNumber
   */
  callToPhone = (toNumber: string, profile?: any, openProfile?: boolean) => {
    const myObj = {
      from: this.phoneNumber,
      to: Utils.standardizePhoneNumber(toNumber),
    };
    console.log('makeCall ', myObj);
    Constants.IsInCall = true;
    this.openProfile = openProfile;
    this.profile = profile;
    this.toNumber = toNumber;
    MoCallCenter.makeCall(myObj.from, myObj.to);
  }

  _didMakeCallHandler = ({callId, toPhone, openProfile}) => {
    console.log(`_didMakeCallHandler callId=${callId} openProfile=${openProfile} toPhone=${toPhone}`);
  }

  _handleAppStateChange = async (nextAppState: any) => {
  }

  updateCurrModule = (moduleName: string) => {
    MoCallCenter.updateCurrModule(moduleName);
  }

  render() {
    return (
      <View />
    );
  }

}

export default CallCenterManager;
