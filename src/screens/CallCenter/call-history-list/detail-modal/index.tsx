import React from 'react';
import { View } from 'react-native';

import { WrapModal, WrapText, ButtonRipple, Router, ScreenType, SafeView } from 'mo-app-comp';
import { Styles, Color, CustomIcon, Utils } from 'mo-app-common';
import PhoneDetail from '../../detail/';
import { callCenter, callMobile, getCallType, getCallTypeIcon, getCallTypeName, convertTimeDuration } from '../../Utils/call';
import styles from './styles';

interface IPhoneDetailModalProps {
  callData: any;
}

export default class PhoneDetailModal extends React.PureComponent<IPhoneDetailModalProps, any> {

  modalRef: WrapModal;

  constructor(props: IPhoneDetailModalProps) {
    super(props);
    this.state = {};
  }

  /**
   * handle open phone detail
   */
  openPhoneDetail = () => {
    const { callData } = this.props;
    this.modalRef.close();
    setTimeout(() => {
      Router.push(<PhoneDetail phoneNumber={callData.customer_phone_number} />, {screenType: ScreenType.CALL_DETAIL});
    }, 50);
  }

  /**
   * render component call type
   * @param {any} callData 
   * @returns 
   */
   renderComponentCallType = (callData: any) => {
    let callType = getCallType(callData);
    const iconType = getCallTypeIcon(callType);
    return (
      <View style={Styles.RowCenter}>
        <CustomIcon name={iconType.name} size={12} color={iconType.color}  />
        <WrapText st={[Styles.Text_S_R, {marginLeft: 8}]}>{getCallTypeName(callType)}</WrapText>
      </View>
    )
  }

  /**
   * render time duration
   * @param duration 
   * @returns 
   */
  renderComponentDuration = (duration: number) => {
    if (!duration) {
      return <View />;
    }
    return (
      <WrapText st={[Styles.Text_S_R]}>{`Thời gian gọi: ${convertTimeDuration(duration)}`}</WrapText>
    );
  }

  onCallMobileHandler = (phone_number: string) => {
    this.modalRef.close();
    callMobile(phone_number);
  }

  onCallPhoneHandler = (phone_number: string) => {
    this.modalRef.close();
    callCenter(phone_number);
  }

  render() {
    const { callData } = this.props;
    // console.log('callData=', callData);
    return(
      <WrapModal
        ref={(ref) => {this.modalRef = ref;}}
        autoOpen={true}
        position={'bottom'}>
        <View style={styles.container}>
          <SafeView>
            <View style={styles.content}>
              <WrapText st={[Styles.Text_L_B, {paddingBottom: 16}]}>{'Chi tiết cuộc gọi'}</WrapText>
              <WrapText st={Styles.Text_S_R}>{`Số điện thoại: ${Utils.formatPhone(callData.customer_phone_number)}`}</WrapText>
              {this.renderComponentCallType(callData)}
              {this.renderComponentDuration(callData.duration)}
            </View>
            

            <View style={styles.rowBottom}>
              <ButtonRipple
                onPress={()=>{this.onCallPhoneHandler(callData.customer_phone_number)}}>
                <View style={[Styles.CenterItem, styles.actionItem]}>
                  <CustomIcon name={'call_centre'} color={Color.primary} size={20} />
                  <WrapText st={[Styles.Text_S_R, {color: Color.primary, marginTop: 4}]} >{'Gọi tổng đài'}</WrapText>
                </View>
              </ButtonRipple>
              <View style={styles.rowBottomDivider} />
              <ButtonRipple
                onPress={()=>{this.onCallMobileHandler(callData.customer_phone_number)}}>
                <View style={[Styles.CenterItem, styles.actionItem]}>
                  <CustomIcon name={'Calling'} color={Color.secondary} size={20} />
                  <WrapText st={[Styles.Text_S_R, {color: Color.secondary, marginTop: 4}]} >{'Gọi điện thoại'}</WrapText>
                </View>
              </ButtonRipple>
              <View style={styles.rowBottomDivider} />
              <ButtonRipple
                onPress={this.openPhoneDetail}>
                <View style={[Styles.CenterItem, styles.actionItem]}>
                  <CustomIcon name={'view_detail'} color={Color.text} size={20} />
                  <WrapText st={[Styles.Text_S_R, {color: Color.text, marginTop: 4}]} >{'Thông tin'}</WrapText>
                </View>
              </ButtonRipple>
            </View>
          </SafeView>
        </View>
      </WrapModal>
    )
  }

}