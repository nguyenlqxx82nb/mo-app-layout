import React from 'react';
import { View, TouchableOpacity, DeviceEventEmitter, EmitterSubscription, Keyboard, Animated } from 'react-native';
import { Color, Constants, CustomIcon, EmitKeys, Styles, Utils, pushModal } from 'mo-app-common';
import { AsyncImage, Router, WrapText, fromTop } from 'mo-app-comp';
import styles from './styles';
import CustomerService from '../../../services/CustomerService';
import CallScreen from '../../CallCenter/call';
import PhoneDetailInfoScreen from '../detail';
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
  userId?: string,
  centerNumber: string;
}

interface ICallScreenState {
  profile: IProfileItem;
  animY: Animated.Value;
}

class PopupCall extends React.PureComponent<ICallScreenProps, ICallScreenState> {

  processing: boolean;

  signalStateChangeSubscription: EmitterSubscription;
  answerSubscription: EmitterSubscription;
  rejectSubscription: EmitterSubscription;
  endCallSubscription: EmitterSubscription;
  anotherSubscription: EmitterSubscription;
  isFinish: boolean;
  constructor(props: ICallScreenProps) {
    super(props);
    const {  profile } = this.props;
    this.state = {
      profile: profile,
      animY: new Animated.Value(-150)
    };
  }

  componentDidMount() {
    Keyboard.dismiss();
    this.signalStateChangeSubscription = DeviceEventEmitter.addListener(EmitKeys.CALL_CENTER_DID_CHANGE_SIGNAL_STATE, this.onSignalStateChangeHandler);
    this.answerSubscription = DeviceEventEmitter.addListener(EmitKeys.CALL_CENTER_DID_ANSWER_PHONE, this.onDidAnswerHandler);
    this.rejectSubscription = DeviceEventEmitter.addListener(EmitKeys.CALL_CENTER_DID_REJECT_PHONE, this.onDidRejectPhoneHandler);
    this.endCallSubscription = DeviceEventEmitter.addListener(EmitKeys.CALL_CENTER_END_CALL, this.onDidEndCallHandler);
    this.anotherSubscription = DeviceEventEmitter.addListener(EmitKeys.CALL_CENTER_HANDLE_ANOTHER_DEVICE, this.onHandleAnotherDeviceHandler);
    this.getProfile();
    this.show();
  }

  componentWillUnmount() {
    this.signalStateChangeSubscription.remove();
    this.answerSubscription.remove();
    this.rejectSubscription.remove();
    this.anotherSubscription.remove();
  }

  onDidRejectPhoneHandler = (_callId: string, status: boolean) => {
    const { callId } = this.props;
    if (!status || callId !== _callId) {
      return;
    }
    this.close();
  }

  onDidEndCallHandler = (_callId: string, status: boolean) => {
    const { callId } = this.props;
    if (!status || callId !== _callId) {
      return;
    }
    this.close();
  }

  onDidAnswerHandler = (_callId: string, _status: boolean) => {
    const { callId, phone_number, centerNumber } = this.props;
    const { profile } = this.state;
    if (_callId !== callId) {
      return;
    }
    this.close();
    setTimeout(() => {
      const modal = {
        content: <CallScreen profile={profile} phone_number={phone_number} callId={callId} isCallTo={false} isAnswered={true} signal_status={2} centerNumber={centerNumber} />
      };
      pushModal(modal);
      setTimeout(() => {
        Router.push(
          <PhoneDetailInfoScreen
              callDurationTime={0}
              profile={profile}
              callId={callId}
              endCallStatus={true}
              phoneNumber={phone_number} />,
            {transitionConfig: fromTop()});
        }, 250);
    }, 150);
  }

  onSignalStateChangeHandler = (code: number) => {
    console.log('onSignalStateChangeHandler ', code);
    const { phone_number } = this.props;
    this.processing = false;
    switch (code) {
      case SIGNAL_STATUS.BUSY: // reject
      case SIGNAL_STATUS.END: // end call
        if (code === SIGNAL_STATUS.BUSY  && !this.isFinish) {
          MoCallCenter.notifyMissCall(phone_number);
        }
        // end call
        this.close();
        break;
      default:
        break;
    }
  }

  onHandleAnotherDeviceHandler = (code: number, _callId: string) => {
    console.log('onHandleAnotherDeviceHandler ', code);
    const { phone_number } = this.props;
    this.processing = false;
    switch (code) {
      case SIGNAL_STATUS.BUSY:
        if (!this.isFinish) {
          MoCallCenter.notifyMissCall(phone_number);
        }
        break;
      default:
        break;
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

  close = () => {
		Keyboard.dismiss();
		const { animY } = this.state;
		Animated.timing(animY , {
      toValue: -150,
      duration: 50,
      useNativeDriver: true,
    }).start(_finish => {
      setTimeout(() => {
        Constants.ModalShowing = false;
        DeviceEventEmitter.emit(Constants.EmitCode.PopModal);
      }, 0);
    });
	}

	show = () => {
		const { animY } = this.state;
		Animated.timing(animY , {
      toValue: Constants.BarHeight + 10,
      duration: 150,
      useNativeDriver: true,
    }).start(_finish => {});
	}

  onDismissCallHandler = () => {
    const { callId } = this.props;

    if (this.processing) {
      return;
    }
    this.processing = true;
    DeviceEventEmitter.emit(EmitKeys.CALL_CENTER_REJECT_PHONE, callId);
  }

  onAnswerPressHandler = () => {
    const { callId } = this.props;
    if (this.processing) {
      return;
    }
    this.processing = true;
    DeviceEventEmitter.emit(EmitKeys.CALL_CENTER_ANSWER_PHONE, callId);
  }

  render() {
    const { phone_number } = this.props;
    const { profile, animY } = this.state;
    const transformContentStyle = {
      transform : [{
        translateY : animY,
      }]
    };
    return (
        <Animated.View style={[styles.container, Styles.Shadow, transformContentStyle]}>
          <View style={[styles.header, Styles.RowCenter]}>
            <WrapText st={[Styles.Text_M_R]} c={'#fff'}>{'Đang gọi đến'}</WrapText>
          </View>
          <View style={[styles.contentContainer]}>
            <View style={[Styles.RowCenter]}>
              <AsyncImage source={{ uri: profile && profile.avatar }} width={22} height={22} radius={11} borderWidth={2} defaultAvatar={true} />
              <WrapText st={[Styles.Text_XXL_B, { color: Color.text, maxWidth: Constants.Width - 100, marginLeft: 10}]}>{profile && profile.name ? Utils.capitalize(profile.name) : phone_number || '--' }</WrapText>
            </View>

            <View style={[Styles.RowCenter, {marginTop: 20}]}>
              <View style={[{flex: 0.5}, Styles.RowCenter]}>
                <TouchableOpacity
                  onPress={this.onAnswerPressHandler}>
                  <View style={[Styles.RowCenter]}>
                    <CustomIcon name={'Calling'} size={20} color={Color.green} />
                    <WrapText st={[Styles.Text_L_R, {marginLeft: 10}]} c={Color.green}>{'Trả lời'}</WrapText>
                  </View>
                </TouchableOpacity>
              </View>
              <View style={[{flex: 0.5, paddingLeft: 20}, Styles.RowCenter]}>
                <TouchableOpacity
                  onPress={this.onDismissCallHandler}>
                  <View style={[Styles.RowCenter]}>
                    <CustomIcon name={'Calling'} size={20} color={Color.red} style={{transform: [{ rotate: '135deg'}]}} />
                    <WrapText st={[Styles.Text_L_R, {marginLeft: 10}]} c={Color.red}>{'Từ chối'}</WrapText>
                  </View>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Animated.View>
    );
  }
}

export default PopupCall;
