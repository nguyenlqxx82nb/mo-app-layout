import React from 'react';
import { View, DeviceEventEmitter, EmitterSubscription, Keyboard } from 'react-native';
import { WrapText, ButtonRipple, Router, AsyncImage, ListView, IModal, SafeView  } from 'mo-app-comp';
import { Color, Constants, Styles, Utils, EmitKeys, pushModal, CustomIcon } from 'mo-app-common';
import { convertTimeDuration, convertCreateTime, getCallType, getCallTypeIcon, getCallTypeName } from '../Utils/call';
import { IProfileItem } from '../Home';
import styles from './styles';
import Sound from 'react-native-sound';
import CallScreen from '../call/index';
import CustomerService from '../../../services/CustomerService';
import PhoneListModal from '../customer-list/phone-list-modal';

export interface IProfileDetailProps {
  profileId?: string
  profile?: IProfileItem,
  phoneNumber?: string,
  callId?: string,
  endCallStatus?: boolean,
  callDurationTime?: number
}

interface IProfileDetailState {
  showPhone: boolean;
  endCallStatus: boolean;
  callDurationTime: number;
  name: string;
  avatar: string;
}

class ProfileDetail extends React.PureComponent<IProfileDetailProps, IProfileDetailState> {

  didCallSubscription: EmitterSubscription;
  ringTone: Sound;

  lwRef: ListView;
  profile: any;

  constructor(props: IProfileDetailProps) {
    super(props);
    const { endCallStatus, callDurationTime } = this.props;
    this.state = {
      showPhone: false,
      endCallStatus: endCallStatus,
      callDurationTime: callDurationTime || 0,
      name: '',
      avatar: ''
    };
  }

  componentDidMount() {
    this.didCallSubscription = DeviceEventEmitter.addListener(EmitKeys.CALL_CENTER_DID_END_CALL, this.onDidEndCallHandler);
    setTimeout(() => {
      this.fetchProfile(this.props);
    }, 0);
  }

  componentWillUnmount() {
    this.didCallSubscription && this.didCallSubscription.remove();
  }

  UNSAFE_componentWillReceiveProps(props: IProfileDetailProps) {
    console.log('phone number ', props.phoneNumber, ' callId=', props.callId);
    if (props.phoneNumber != this.props.phoneNumber) {
      this.fetchProfile(props);
    } else {
      this.lwRef.refreshData();
    }
  }

  /**
   * fetch detail profile
   */
  fetchProfile = async (props: IProfileDetailProps) => {
    const { phoneNumber, profileId } = props;
    let response;
    if (profileId) {
      response = await CustomerService.fetchByProfileIds([profileId]);
    } else {
      const query: string =phoneNumber && phoneNumber.replace('+84', '0');
      response = await CustomerService.searchUser({ query: query });
    }
    //const response = await CustomerService.searchUser({ query: query });
    if (response.result && response.result.data && response.result.data.length) {
      this.profile = response.result.data[0];
      console.log('profile=', this.profile, " phoneNumber=",phoneNumber);
      this.setState({
        name: this.profile.name,
        avatar: this.profile.avatar
      });
    }
    this.lwRef.refreshData();
  }

  pushCallModal = () => {
    const { phoneNumber, callId } = this.props;
    const modal = {
			content: <CallScreen phone_number={phoneNumber} callId={callId} isCallTo={false} />
		};
		pushModal(modal);
  }

  onBackHandler = () => {
    Router.pop();
  }

  /**
   * handle load data
   * @param page 
   * @param per_page 
   * @param onLoadDataCompleted 
   */
   onLoadDataHandler = async (page: number, per_page: number, onLoadDataCompleted: any) => {
    const { phoneNumber } = this.props;
    const result = await CustomerService.fetchHistoryCallList(this.profile ? '' : phoneNumber, per_page, page, false, '', this.profile ? this.profile.id: null);
    onLoadDataCompleted(result.data || []);
  }

  /**
   * handle load more data
   * @param page 
   * @param per_page 
   * @param onLoadDataMoreCompleted 
   */
  onLoadMoreDataHandler = async (page: number, per_page: number, onLoadDataMoreCompleted: any) => {
    const { phoneNumber } = this.props;
    const result = await CustomerService.fetchHistoryCallList(this.profile ? '' : phoneNumber, per_page, page, false, '', this.profile ? this.profile.id: null);
    onLoadDataMoreCompleted(result.data || []);
  }

  /**
   * handle call press
   * @param item 
   */
  onCallItemPressHandler = () => {
    const { phoneNumber } = this.props;
    Keyboard.dismiss();
    const phone_number = (this.profile && this.profile.phone_number.length && this.profile.phone_number) || [phoneNumber]; 
    const modal: IModal = {
      content: <PhoneListModal phone_number={phone_number}/>
    }
    pushModal(modal);
  }

  onCallPhoneHandler = (phone_number: string) => {
    Keyboard.dismiss();
    const modal: IModal = {
      content: <PhoneListModal phone_number={[phone_number]}/>
    }
    pushModal(modal);
  }

  /**
   * render call history item
   * @param _type 
   * @param item 
   * @param _index 
   * @param lastIndex 
   * @returns 
   */
  renderRowItem = (_type: any, item: any, _index: number, lastIndex: boolean) => { 
    const callType = getCallType(item);
    const iconType = getCallTypeIcon(callType);
    return (
      <ButtonRipple 
        radius={5}
        color={Color.text}
        onPress={()=>{this.onCallPhoneHandler(item.customer_phone_number)}}>
          <View style={styles.rowItem}>
            <View style={styles.rowItemLeft}>
              <CustomIcon name={iconType.name} size={12} color={iconType.color} />
            </View>
            <View style={[styles.rowItemRight, lastIndex ? {borderBottomWidth: 0} : {}]}>
              <View>
                <WrapText st={[Styles.Text_M_SB, {marginBottom: 4}]}>{Utils.formatPhone(item.customer_phone_number)}</WrapText>
                <View style={Styles.RowCenter}>
                  <WrapText st={[Styles.Text_S_R, {color: Color.textSecondary}]}>{getCallTypeName(callType)}</WrapText>
                  <WrapText st={[Styles.Text_S_R, {color: Color.textSecondary}]}>{item.duration ? `, ${convertTimeDuration(item.duration)}` : ''}</WrapText>
                </View>
              </View>
              <WrapText st={[Styles.Text_S_R,  {color: Color.textSecondary}]}>{convertCreateTime(item.time)}</WrapText>
            </View>
          </View>
      </ButtonRipple>
    )
  }

  render() {
    const { phoneNumber } = this.props
    const { name, avatar } = this.state;
    const phoneEnable = (this.profile && this.profile.phone_number.length) || phoneNumber;
    return (
      <View style={styles.container}>
        <SafeView>
          <View style={styles.header}>
            <ButtonRipple 
              name={'nav_back'} 
              color={Color.text} 
              size={16} 
              width={40}
              height={40}
              onPress={this.onBackHandler} />
            <WrapText st={Styles.Text_XL_B} >{'Chi tiết'}</WrapText>
          </View>

          <View style={[Styles.FlexGrow, {paddingHorizontal: 16}]}>
            <View style={[Styles.AlignCenter]}>
              <AsyncImage 
                source={{ uri: avatar }}
                width={80} height={80} radius={40} style={{ marginTop: 5 }}
                defaultAvatar={true} />

              <WrapText st={[Styles.Text_L_SB, { color: Color.text, maxWidth: 280, marginTop: 8 }]}>{name || (phoneNumber && Utils.formatPhone(phoneNumber)) || '--'}</WrapText>

            </View>

            <View style={[Styles.RowCenter,{marginTop: 8, marginBottom: 12}]}>

              <ButtonRipple
                enable={phoneEnable}
                radius={8}
                containerStyle={{}}
                onPress={this.onCallItemPressHandler}>
                <View style={[styles.workItem]}>
                  <CustomIcon name={'contact_call'} size={16} color={Color.primary} />
                  <WrapText st={[Styles.Text_T_SB, {marginTop: 4, color: Color.primary}]}>{'Gọi điện'}</WrapText>
                </View>
              </ButtonRipple>

              <ButtonRipple
                enable={false}
                radius={8}
                containerStyle={{marginLeft: 16}}
                onPress={()=>{}}>
                <View style={[styles.workItem]}>
                  <CustomIcon name={'contact_SMS'} size={16} color={Color.primary} />
                  <WrapText st={[Styles.Text_T_SB, {marginTop: 4, color: Color.primary}]}>{'SMS'}</WrapText>
                </View>
              </ButtonRipple>

              <ButtonRipple
                enable={false}
                radius={8}
                containerStyle={{marginLeft: 16}}
                onPress={()=>{}}>
                <View style={[styles.workItem]}>
                  <CustomIcon name={'create_task'} size={16} color={Color.primary} />
                  <WrapText st={[Styles.Text_T_SB, {marginTop: 4, color: Color.primary}]}>{'Công việc'}</WrapText>
                </View>
              </ButtonRipple>

              <ButtonRipple
                enable={false}
                radius={8}
                containerStyle={{marginLeft: 16}}
                onPress={()=>{}}>
                <View style={[styles.workItem]}>
                  <CustomIcon name={'create_note'} size={16} color={Color.primary} />
                  <WrapText st={[Styles.Text_T_SB, {marginTop: 4, color: Color.primary}]}>{'Ghi chú'}</WrapText>
                </View>
              </ButtonRipple>

            </View>

            <View style={[styles.otherContact]}>
              <WrapText st={[Styles.Text_L_M, {  marginBottom: 5, paddingLeft: 16 }]}>{'Hình thức liên hệ khác'}</WrapText>
              <View style={[Styles.RowCenter]}>
                
                <ButtonRipple
                  enable={false}
                  containerStyle={{marginRight: 10, marginLeft: 6}}
                  onPress={()=>{}}>
                  <View style={styles.otherContactItem}>
                    <CustomIcon name={'contact_email'} size={25} color={Color.primary} />
                  </View>
                </ButtonRipple>

                <ButtonRipple
                  enable={false}
                  containerStyle={{marginRight: 10}}
                  onPress={()=>{}}>
                  <View style={styles.otherContactItem}>
                    <CustomIcon name={'contact_messenger'} size={25} color={Color.primary} />
                  </View>
                </ButtonRipple>

                <ButtonRipple
                  enable={false}
                  containerStyle={{marginRight: 10}}
                  onPress={()=>{}}>
                  <View style={styles.otherContactItem}>
                    <CustomIcon name={'contact_zalo'} size={25} color={Color.primary} />
                  </View>
                </ButtonRipple>

              </View>
              
            </View>

            <View style={[styles.callHisContainer]}>
              <ListView
                ref={(comp: any) => { this.lwRef = comp; }}
                onRenderRow={this.renderRowItem}
                wr={Constants.Width - 32}
                hr={75}
                autoH={true}
                top={0}
                bottom={20}
                pageSize={25}
                autoLoad={false}
                hasExtendedState={true}
                onLoad={this.onLoadDataHandler}
                onLoadMore={this.onLoadMoreDataHandler}
                containerStyle={{ marginHorizontal: 0, paddingHorizontal: 0, borderRadius: 8 }}
                loadAllMessage={'Đã xem hết'}
                noneItemsMsg={'Chưa có cuộc gọi nào'} />
            </View>

          </View>
        </SafeView>
      </View>
    );
  }

}

export default ProfileDetail;
