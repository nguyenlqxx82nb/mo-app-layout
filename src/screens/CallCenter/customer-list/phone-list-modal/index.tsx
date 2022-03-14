import React from 'react';
import { View, ScrollView } from 'react-native';
import { WrapModal, WrapText, ButtonRipple } from 'mo-app-comp';
import { Device, Styles, Color, CustomIcon, Utils } from 'mo-app-common';
import { callCenter, callMobile } from '../../Utils/call';
import styles from './styles';

interface IPhoneListModalProps {
  phone_number: string[];
}

interface IPhoneListModalState {
  selectedIndex: number;
}

export default class PhoneListModal extends React.PureComponent<IPhoneListModalProps, IPhoneListModalState> {

  modalRef: WrapModal;
  
  constructor(props: IPhoneListModalProps) {
    super(props);
    this.state = {
      selectedIndex : 0
    }
  }

  /**
   * render row item
   * @param phoneNumber 
   * @param index 
   * @returns 
   */
  renderPhoneItem = (phoneNumber: string, index: number) => {
    const { selectedIndex } = this.state;
    if (index >= 15) {
      return <View/>
    }

    if (selectedIndex === index) {
      return (
        <View>
          <ButtonRipple
            radius={5}
            onPress={()=>{this.onToggleSelectItem(index);}}>
            <View style={styles.rowSelectedHeader}>
              <WrapText st={Styles.Text_M_R}>{Utils.formatPhone(phoneNumber)}</WrapText>
              <ButtonRipple 
                name={'drop_down'}
                width={25}
                height={25}
                size={9}
                color={Color.text}
                onPress={()=>{this.onToggleSelectItem(index);}}
              />
            </View>
          </ButtonRipple>
          

          <View style={styles.rowSelectedBody}>

            <ButtonRipple
              onPress={()=>{this.onCallPhoneHandler(phoneNumber)}}>
              <View style={[Styles.CenterItem, {paddingHorizontal: 20, paddingVertical: 8}]}>
                <CustomIcon name={'call_centre'} color={Color.primary} size={20} />
                <WrapText st={[Styles.Text_S_R, {color: Color.primary, marginTop: 4}]} >{'Gọi qua tổng đài'}</WrapText>
              </View>
            </ButtonRipple>

            <View style={styles.rowSelectedDivider} />

            <ButtonRipple
              color={Color.secondary}
              onPress={()=>{this.onCallMobileHandler(phoneNumber)}}>
              <View style={[Styles.CenterItem, {paddingHorizontal: 20, paddingVertical: 8}]}>
                <CustomIcon name={'Calling'} color={Color.secondary} size={20} />
                <WrapText st={[Styles.Text_S_R, {color: Color.secondary, marginTop: 4}]} >{'Gọi qua điện thoại'}</WrapText>
              </View>
            </ButtonRipple>

          </View>

        </View>
      )
    }

    return (
      <ButtonRipple
        color={'#000'}
        radius={5}
        onPress={()=>{this.onToggleSelectItem(index);}}>
        <View style={styles.rowItem}>
          <WrapText st={Styles.Text_M_R}>{Utils.formatPhone(phoneNumber)}</WrapText>
          <ButtonRipple 
            name={'next'}
            width={25}
            height={25}
            size={9}
            color={Color.text}
            onPress={()=>{this.onToggleSelectItem(index);}}
          />
        </View>
      </ButtonRipple>
    )   
  }

  onToggleSelectItem = (index: number) => {
    const { selectedIndex } = this.state;
    if (selectedIndex !== index) {
      this.setState({
        selectedIndex: index
      });
      return;
    }
    this.setState({
      selectedIndex: -1
    });
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
    const { phone_number } = this.props;
    
    return(
      <WrapModal
        ref={(ref) => {this.modalRef = ref;}}
        autoOpen={true}
        position={'bottom'}>
        <View style={styles.container}>
          <WrapText st={[Styles.Text_M_B, {paddingHorizontal:16, paddingVertical: 16}]}>{'Thực hiện cuộc gọi'}</WrapText>
          <ScrollView 
            showsVerticalScrollIndicator={true}
            contentContainerStyle={{ paddingBottom: Device.isIphoneX ? 35 + 15 : 15 }}>
            {
              phone_number.map((item: string, index: number) => {
                return this.renderPhoneItem(item, index);
              })
            }
          </ScrollView>
        </View>
      </WrapModal>
    )
  }

}