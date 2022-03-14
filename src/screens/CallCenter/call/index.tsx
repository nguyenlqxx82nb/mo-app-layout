import React from 'react';
import { View, TouchableOpacity, DeviceEventEmitter, EmitterSubscription, Keyboard, Animated } from 'react-native';
import { Color, Constants, CustomIcon, EmitKeys, Styles, Utils, toast, StringeeService, pushModal } from 'mo-app-common';
import { AsyncImage, WrapText } from 'mo-app-comp';
import styles from './styles';
import CustomerService from '../../../services/CustomerService';
import PhoneDigitModal from '../phone-digit/index';
import { getStatusBarHeight } from 'react-native-status-bar-height';
import { IProfileItem } from '../Home';
import MoCallCenter from '../../../services/stringee';

const SIGNAL_STATUS = {
  WAITING: 1,
  ANSWERED: 2,
  BUSY: 3,
  END: 4
};

export interface ICallScreenProps {
  profile?: IProfileItem,
  phone_number: string,
  callId: string,
  userId?: string
  isCallTo: boolean,
  signal_status?: number,
  isAnswered?: boolean,
  centerNumber?: string;
}

interface ICallScreenState {
  signal_status: number;
  time: number;
  isSpeaker: boolean;
  isAnswered: boolean;
  profile: IProfileItem;
  centerNumber: string;
  animY: Animated.Value;
}

class CallScreen extends React.PureComponent<ICallScreenProps, ICallScreenState> {
  static defaultProps = {
    openProfile: true,
    signal_status: SIGNAL_STATUS.WAITING
  }
  processing: boolean;
  timeInterval: any;

  signalStateChangeSubscription: EmitterSubscription;
  endCallSubscription: EmitterSubscription;
  speakerSubscription: EmitterSubscription;
  answerSubscription: EmitterSubscription;
  rejectSubscription: EmitterSubscription;
  anotherSubscription: EmitterSubscription;
  phoneDigitRef: PhoneDigitModal;
  isFinish: boolean;

  constructor(props: ICallScreenProps) {
    super(props);
    const { profile, isAnswered, signal_status, centerNumber } = this.props;
    this.state = {
      signal_status: signal_status,
      time: 0,
      isSpeaker: false,
      isAnswered: isAnswered,
      profile: profile,
      centerNumber: centerNumber,
      animY: new Animated.Value(Constants.Height)
    };

    this.timeInterval = setInterval(()=> {
      const { time } = this.state;
      if (this.state.signal_status === SIGNAL_STATUS.ANSWERED) {
        this.setState({
          time: time + 1
        });
      }
    }, 1000);
  }

  componentDidMount() {
    this.show();
    Keyboard.dismiss();
    this.signalStateChangeSubscription = DeviceEventEmitter.addListener(EmitKeys.CALL_CENTER_DID_CHANGE_SIGNAL_STATE, this.onSignalStateChangeHandler);
    this.endCallSubscription = DeviceEventEmitter.addListener(EmitKeys.CALL_CENTER_END_CALL, this.onEndCallHandler);
    this.speakerSubscription = DeviceEventEmitter.addListener(EmitKeys.CALL_CENTER_DID_SPEAKER_CHANGE, this.onSpeakerDidChangeHandler);
    this.answerSubscription = DeviceEventEmitter.addListener(EmitKeys.CALL_CENTER_DID_ANSWER_PHONE, this.onDidAnswerHandler);
    this.rejectSubscription = DeviceEventEmitter.addListener(EmitKeys.CALL_CENTER_DID_REJECT_PHONE, this.onDidRejectPhoneHandler);
    this.anotherSubscription = DeviceEventEmitter.addListener(EmitKeys.CALL_CENTER_HANDLE_ANOTHER_DEVICE, this.onHandleAnotherDeviceHandler);
    this.getProfile();
  }

  componentWillUnmount() {
    this.signalStateChangeSubscription.remove();
    this.endCallSubscription.remove();
    this.speakerSubscription.remove();
    this.answerSubscription.remove();
    this.rejectSubscription.remove();
    this.anotherSubscription.remove();

    clearInterval(this.timeInterval);
  }


  getCallLogs = async () => {
    const { isCallTo } = this.props;
    if (!isCallTo) {
      return;
    }
    const res: any = await StringeeService.getLogs();
    // console.log('getCallLogs ', res);
    if (res.r === 0 && res.data && res.data.calls && res.data.calls.length) {
      const item = res.data.calls[0];
      let centerNumber = item.callee || item.from_number;
      if (centerNumber) {
        this.setState({centerNumber: centerNumber}, () => {
          this.forceUpdate();
        });
      }
    }
  }

  getProfile = async () => {
    const { phone_number } = this.props;
    const { profile } = this.state;
    if (profile) {
      return;
    }
    let phone: string = phone_number && phone_number.replace('+84', '0');
    const response = await CustomerService.searchUser({ query: phone });
    if (response.result && response.result.data && response.result.data.length) {
      const _profile = response.result.data[0];
      this.setState({
        profile: _profile
      });
    }
  }

  onDismissCallHandler = () => {
    const { callId, isCallTo } = this.props;
    const { isAnswered } = this.state;

    if (this.processing) {
      return;
    }
    this.processing = true;
    this.isFinish = true;
    if (isCallTo || isAnswered) {
      DeviceEventEmitter.emit(EmitKeys.CALL_CENTER_DO_HANG_UP, callId);
      return;
    }
    DeviceEventEmitter.emit(EmitKeys.CALL_CENTER_REJECT_PHONE, callId);
  }

  onSignalStateChangeHandler = (code: number) => {
    console.log('onSignalStateChangeHandler ', code);
    const { phone_number, isCallTo } = this.props;
    this.processing = false;
    switch (code) {
      case SIGNAL_STATUS.BUSY:
      case SIGNAL_STATUS.END:
        this.setState({signal_status: code});
        if (code === SIGNAL_STATUS.BUSY && !isCallTo && !this.isFinish) {
          MoCallCenter.notifyMissCall(phone_number);
        }
        break;
      case SIGNAL_STATUS.ANSWERED:
        this.setState({signal_status: SIGNAL_STATUS.ANSWERED, time: 0});
        this.getCallLogs();
        break;
      default:
        break;
    }
  }

  onHandleAnotherDeviceHandler = (code: number, _callId: string) => {
    console.log('onHandleAnotherDeviceHandler ', code);
    const { phone_number, isCallTo } = this.props;
    this.processing = false;
    switch (code) {
      case SIGNAL_STATUS.BUSY:
        if (!isCallTo && !this.isFinish) {
          MoCallCenter.notifyMissCall(phone_number);
        }
        break;
      default:
        break;
    }
  }

  onEndCallHandler = (_callId: string, status: boolean) => {
    // const { callId } = this.props;
    console.log('onEndCallHandler ', _callId, status);
    if (!status) {
      return;
    }
    this.endCall();
  }

  endCall = () => {
    const { time, signal_status, profile } = this.state;
    const { callId, phone_number } = this.props;
    // console.log('endCall ', profile);
    DeviceEventEmitter.emit(EmitKeys.CALL_CENTER_DID_END_CALL,time,signal_status,callId, profile, phone_number);
    this.close();
  }

  onSpeakerPressHandler = () => {
    const { callId } = this.props;
    const { isSpeaker } = this.state;
    DeviceEventEmitter.emit(EmitKeys.CALL_CENTER_SPEAKER_CHANGE, !isSpeaker, callId);
  }

  onSpeakerDidChangeHandler = (isSpeaker: boolean, _status: boolean) => {
    this.setState({isSpeaker: isSpeaker});
  }

  onAnswerPressHandler = () => {
    const { callId } = this.props;
    if (this.processing) {
      return;
    }
    this.processing = true;
    DeviceEventEmitter.emit(EmitKeys.CALL_CENTER_ANSWER_PHONE, callId);
  }

  onDidAnswerHandler = (_callId: string, _status: boolean) => {
    const { callId } = this.props;
    if (_callId !== callId) {
      return;
    }
    this.setState({isAnswered: true});
  }

  onDidRejectPhoneHandler = (_callId: string, status: boolean) => {
    const { callId } = this.props;
    if (!status || callId !== _callId) {
      return;
    }
    this.endCall();
  }

  onDigitPressHandler = () => {
    const { callId } = this.props;
    // this.phoneDigitRef.show();
    const modal = {
      content: <PhoneDigitModal callId={callId} />
    };
    pushModal(modal);
  }

  getMessageCall = () => {
    const { isCallTo } = this.props;
    const { signal_status, centerNumber } = this.state;
    // console.log('getMessageCall ', centerNumber);
    let message = '';
    if (!centerNumber) {
      return '';
    }
    const display_phone = centerNumber.replace('84','0');
    if (isCallTo) {
      message = `Tổng đài gọi ra: ${display_phone}`;
      return message;
    }
    if (signal_status !== SIGNAL_STATUS.WAITING ) {
      message = `Tổng đài nhận cuộc gọi: ${display_phone}`;
      return message;
    }
  }

  getMessagePhoneDuration = () => {
    const { isCallTo } = this.props;
    const { signal_status, time } = this.state;

    let message = '';
    if (isCallTo) {
      message = 'Đang gọi đi';
    } else {
      message = 'Đang gọi đến';
    }

    if (signal_status !== SIGNAL_STATUS.WAITING) {
      const minute = Math.floor(time / 60);
      const second = time - minute * 60;
      const _m = minute < 10 ? `0${minute}` : `${minute}`;
      const _s = second < 10 ? `0${second}` : `${second}`;
      message = `${_m}:${_s}`;
    }

    return message;
  }

  close = () => {
		Keyboard.dismiss();
		const { animY } = this.state;
		Animated.timing(animY , {
      toValue: Constants.Height + 50,
      duration: 200,
      useNativeDriver: true,
    }).start(_finish => {
      setTimeout(() => {
        Constants.ModalShowing = false;
        DeviceEventEmitter.emit(Constants.EmitCode.PopModal);
      }, 20);
      // console.log('close finish')
    });
	}

	show = () => {
		const { animY } = this.state;
		Animated.timing(animY , {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(_finish => {
      // console.log('show finish')
    });
	}

  render() {
    const { phone_number, isCallTo } = this.props;
    const { isSpeaker, isAnswered, profile, signal_status, animY } = this.state;
    const paddingTop = getStatusBarHeight() + 10;
    const transformContentStyle = {
      transform : [{
        translateY : animY,
      }]
    };
    return (
      <Animated.View style={[styles.container, { paddingTop: paddingTop}, transformContentStyle]}>
        <View style={{ height: 20, marginLeft: 20}}>
          <WrapText st={[Styles.Text_S_R]} c={Color.textSecondary}>{this.getMessageCall()}</WrapText>
        </View>
        <View style={[Styles.Flex, Styles.AlignCenter, { paddingHorizontal: 32 }]}>
          <AsyncImage source={{ uri: profile && profile.avatar }} width={125} height={125} radius={75} borderWidth={2} style={{ marginTop: 44 }} defaultAvatar={true} />
          <WrapText st={[Styles.Text_L_M, { color: Color.text, maxWidth: Constants.Width - 100, marginTop: 30 }]}>{profile && profile.name ? Utils.capitalize(profile.name) : '--' }</WrapText>
          <WrapText st={[Styles.Text_M_R, { marginTop: 6 }]}>{phone_number}</WrapText>
          <WrapText st={[Styles.Text_S_R, { marginTop: 6, color: Color.textSecondary }]}>{profile ? profile.email : '--'}</WrapText>

          <WrapText st={[Styles.Text_S_R, { marginTop: 30 }]}>{this.getMessagePhoneDuration()}</WrapText>
          {
            signal_status === SIGNAL_STATUS.ANSWERED &&
            <View style={[Styles.RowCenter, { marginTop: 30 }]}>

              <View style={{ flex: 1 / 3, alignItems: 'flex-start'}}>
                <View style={[Styles.CenterItem, { width: 60 }]}>
                  <TouchableOpacity onPress={this.onDigitPressHandler}>
                    <View style={styles.buttonIcon}>
                      <CustomIcon name={'dial_pad'} size={30} color={Color.text} />
                    </View>
                    <WrapText st={[Styles.Text_S_M, { marginTop: 10 }]}>{'Bàn phím'}</WrapText>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={{ flex: 1 / 3, alignItems: 'center' }}>
                <View style={[Styles.CenterItem]}>
                  <TouchableOpacity style={[Styles.CenterItem]}
                    onPress={()=> {toast('Chức năng đang phát triển sau!', 'info');}}>
                    <View style={styles.buttonIcon}>
                      <CustomIcon name={'assign_to1'} size={30} color={Color.text} />
                    </View>
                    <WrapText st={[Styles.Text_S_M, { marginTop: 10 }]}>{'Chuyển tiếp'}</WrapText>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={{ flex: 1 / 3, alignItems: 'flex-end' }}>
                <View style={[Styles.CenterItem, { width: 70 }]}>
                  <TouchableOpacity style={[Styles.CenterItem]}
                    onPress={this.onSpeakerPressHandler}>
                    <View style={[styles.buttonIcon, isSpeaker ? {backgroundColor: Color.primary} : {}]}>
                      <CustomIcon name={'no_speaker'} size={30} color={ isSpeaker ? '#fff' : Color.text} />
                    </View>
                    <WrapText st={[Styles.Text_S_M, { marginTop: 10 }]}>{'Loa ngoài'}</WrapText>
                  </TouchableOpacity>
                </View>
              </View>

            </View>
          }
        </View>

        <View style={[styles.bottomControlContainer, isCallTo || isAnswered ? {justifyContent: 'center'} : {}]}>
          {
            (!isAnswered && !isCallTo) &&
            <TouchableOpacity
              onPress={this.onAnswerPressHandler}>
              <View style={styles.buttonCall}>
                <CustomIcon name={'Calling'} size={30} color={'#fff'} />
              </View>
            </TouchableOpacity>
          }
          <TouchableOpacity onPress={this.onDismissCallHandler}>
            <View style={styles.buttonDismissCall}>
              <CustomIcon name={'hang_up'} size={30} color={'#fff'} />
            </View>
          </TouchableOpacity>
        </View>
      </Animated.View>
    );
  }
}

export default CallScreen;
