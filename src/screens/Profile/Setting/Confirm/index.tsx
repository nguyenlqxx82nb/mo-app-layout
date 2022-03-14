import React from 'react';
import { StyleSheet, View, ActivityIndicator, Keyboard } from 'react-native';
import { Color, Constants, pushModal, JwtHelper, Styles } from 'mo-app-common';
import { ButtonRipple, WrapModal, WrapText, FormInput, NotificationModal } from 'mo-app-comp';
import AuthService from '../../../../services/AuthService';
export default class ConfirmModal extends React.PureComponent<any, any> {

  modalRef: WrapModal;
  passRef: FormInput;
  static defaultProps = {}

  constructor(props: any) {
    super(props);
    this.state = {
      isLoading: false
    }
  }

  componentDidMount() {}

  onConfirmPasswordPressHandler = async () => {
    const { onConfirmOk } = this.props;
    const { isLoading } = this.state;
    if (isLoading) {
      return;
    }
    this.passRef.validate();
    const pass = this.passRef.getValue();
    if (!pass) {
      return;
    }
    Keyboard.dismiss();
    this.setState({
      isLoading: true
    });
    const userInfo = JwtHelper.decodeToken();
    const response = await AuthService.checkPassword(userInfo.accessName, pass);
    console.log('checkPassword response=', response);
    if (response.code !== 200) {
      this.modalRef.close();
      setTimeout(() => {
        const modal = {
          content: <NotificationModal
            content={'Xác thực mật khẩu không thành công'}
            iconName={'error_connection'}
            iconColor={Color.red}
            autoOpen={true}
            overlayClose={false}
            buttons={[{ name: 'Đóng' }]} />
        };
        pushModal(modal);  
      }, 500);
      return;
    }
    // console.log('onConfirmPasswordPressHandler val=',pass, ' userInfo=', userInfo);
    this.modalRef.close();
    setTimeout(() => {
      onConfirmOk && onConfirmOk();
    }, 500);
  }
  
  render() {
    const { isLoading } = this.state;
    const { isActive } = this.props;
    const subTitle = isActive ? 'Vui lòng xác thực bằng mật khẩu đăng nhập của bạn để kích hoạt tính năng này.' 
      : 'Vui lòng xác thực bằng mật khẩu đăng nhập của bạn để tắt tính năng này.';
    return (
      <WrapModal
        ref={(comp: any) => { this.modalRef = comp; }}
        autoOpen={true}
        overlayOpacity={0.65}
        backDropClose={false}
        position={'center'}>
        <View style={[styles.container]}>
          <WrapText s={14} f={"m"}>{'Thông báo'}</WrapText>
          <WrapText s={12} f={"r"} nl={3} st={{marginTop: 20}}>{subTitle}</WrapText>
          
          <View style={{marginTop: 20}}>
            <FormInput 
              ref={(comp: any) => { this.passRef = comp; }}
              isPassword={true}
              placeholder={'Nhập mật khẩu'}
              containerStyle={{}}
              autoValidate={false}
              emptyErrorMessage={'Vui lòng nhập mật khẩu'}
            />
          </View>
          <View style={[{width: '100%', alignItems: 'center' }]}>
            <ButtonRipple
              onPress={this.onConfirmPasswordPressHandler.bind(this)}
              // containerStyle={[styles.rippleButton]}
              color={Color.primary}
              content={<WrapText st={{paddingHorizontal: 16, paddingVertical: 8}} s={18} c={Color.primary} f={'m'}>{'Xác thực'}</WrapText>}
            />
          </View>
          

          {isLoading && 
            <View style={styles.loadingContainer}>
              <View style={styles.overlay}>
              </View>
              <ActivityIndicator
                    size={'large'}
                    color={Color.primary}
                    style={[
                      { borderRadius: 20 },
                    ]} />
            </View>}
        </View>
      </WrapModal>
    );
  }

}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    width: Constants.Width - 32,
    borderRadius: 10,
    flexDirection: 'column',
    paddingVertical: 20,
    paddingBottom: 12,
    paddingHorizontal: 16,
  },
  rippleButton: {
    width: '100%',
    height:45
  },
  loadingContainer: {
    justifyContent:'center', 
    alignItems:'center',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#fff',
    opacity: 0.65,
    borderRadius: 10
  }
});

