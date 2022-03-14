import React from 'react';
import { View, Keyboard, Image, Platform } from 'react-native';
import { WrapButton, WrapText, Router, FormEdit, KeyboardScrollView, NotificationModal, ButtonRipple } from 'mo-app-comp';
import { Constants, CommonLanguage, checkConnection, toast, Color, Storage,
  StorageKeys, onLogin, Utils, AdminService, HOST_PROFILING, HOST_CALL_CENTER, Styles, pushModal, HOST_ADM } from 'mo-app-common';
// import { connect } from 'react-redux';
import { AuthService } from '../../services';
import { MainScreen } from '../Main';
import MoCallCenter from '../../services/stringee';
import PushNotification from '../../services/notification';
import { getStatusBarHeight } from 'react-native-status-bar-height';
import MoFingerprint from '../../services/finger';
import styles from './styles';


interface ILoginContainerState {
  isSensorAvailable: boolean;
  isTouchID: boolean;
  loading: boolean;
  isFingerFailed: boolean;
  screenHeight: number;
}

class LoginContainer extends React.PureComponent<any, ILoginContainerState> {
  keyboardDidHideListener: any;
  keyboardDidShowListener: any;

  _usernameRef: FormEdit;
  _passRef: FormEdit;
  loginBtnRef: any;
  fingerBtnRef: any;

  firstLoad: boolean = true;

  constructor(props: any) {
    super(props);
    this.state = {
      loading: false,
      isSensorAvailable: false,
      isTouchID: Platform.OS === 'android' ? true : false,
      isFingerFailed: false,
      screenHeight: Constants.Height
    };
  }

  async componentDidMount() {
    MoFingerprint
      .isSensorAvailable()
      .then(biometryType => {
        this.handleCheckSensorAvailable(biometryType);
      })
      .catch(error => { });
  }

  /**
   * handle check sensor available
   * @param biometryType
   */
  handleCheckSensorAvailable(biometryType: string) {
    let isTouchID = true; 
    if (biometryType != 'Touch ID' && Platform.OS === 'ios') {
      isTouchID = false;
    }
    this.setState({isSensorAvailable: true, isTouchID: isTouchID});
    if (isTouchID) {
      setTimeout(() => {
        if (Constants.FingerStatus === 1) {
          this.showFingerprint();
        }
      }, 50);
    }
  }

  validate() {
    const loginValid = this._usernameRef.validate();
    const passValid = this._passRef.validate();

    if (!loginValid || !passValid) {
      return false;
    }
    return true;
  }

  resetLogin() { }

  async login(username: string, password: string) {
    try {
      const { routes, mainTabIndex } = this.props;
      this.setState({ loading: true });
      const response = await AuthService.login(username, password);
      if (response.code !== 200 && response.code !== 500) {
        toast('Mật khẩu hoặc tên đăng nhập không đúng. Vui lòng nhập lại.');
        this.setState({ loading: false });
        return;
      }
      if (response.code === 200 && response.result) {
        await this.initData(response.result.jwt, username, password);
        onLogin();
        Router.replace(<MainScreen routes={routes} mainTabIndex={mainTabIndex} />);
      }
      this.setState({ loading: false });
    } catch (error) {
      toast(CommonLanguage.ProcessError);
    }
  }

  /**
   * init data
   * @param token
   * @param username
   * @param password
   * @returns
   */
  initData = async (token: string, username: string, password: string) => {
    Storage.setItem(StorageKeys.USER_NAME, username);
    Storage.setItem(StorageKeys.PASSWORD, password);
    Storage.setItem(StorageKeys.LOGIN_STATUS, 3);
    Constants.MerchantId = undefined;
    Constants.AuthToken = undefined;
    Constants.Username = username;
    Constants.Password = password;
    await Utils.initGlobalData(token);
    const pathOnPremiseHandle: any = AuthService.getPathOnPremise();
    const accountSettingHandle: any = AdminService.getAccountSetting();

    const pathOnPremise = await pathOnPremiseHandle;
    const accountSetting = await accountSettingHandle;

    Storage.setItem(StorageKeys.PathAds, pathOnPremise.ads_host);
    Storage.setItem(StorageKeys.PathAudience, pathOnPremise.au_host);
    Storage.setItem(StorageKeys.PathCallCenter, pathOnPremise.callcenter_host);
    Storage.setItem(StorageKeys.PathChattool, pathOnPremise.chattool_host);
    Storage.setItem(StorageKeys.PathCRM, pathOnPremise.crm_host);
    Storage.setItem(StorageKeys.PathEMK, pathOnPremise.emk_host);
    Storage.setItem(StorageKeys.PathLoyalty, pathOnPremise.loyalty_host);
    Storage.setItem(StorageKeys.PathMarketing, pathOnPremise.mkt_host);
    Storage.setItem(StorageKeys.PathNM, pathOnPremise.nm_host);
    Storage.setItem(StorageKeys.PathProductLibrary, pathOnPremise.products_host);
    Storage.setItem(StorageKeys.PathProfiling, pathOnPremise.profiling_host);
    Storage.setItem(StorageKeys.PathSale, pathOnPremise.sale_host);
    Storage.setItem(StorageKeys.PathSocial, pathOnPremise.social_host);
    Storage.setItem(StorageKeys.PathTicket, pathOnPremise.ticket_host);
    Storage.setItem(StorageKeys.KEY_CACHE_SETTING_ALL, accountSetting);

    const resAllPermisions: any = await AdminService.getPermisions();
    if (!resAllPermisions || !resAllPermisions.functions) {
      return;
    }
    const allPermission = resAllPermisions.functions.account_functions;
    const socialPermisions = allPermission.filter(permision => { return permision.parent === 'SOCIAL'; });
    await Storage.setItem(StorageKeys.SOCIAL_ROLES, socialPermisions);

    setTimeout(() => {
      this.initNativeValues(token, pathOnPremise, accountSetting);
      PushNotification.setValue('AUTH_TOKEN', Constants.AuthToken);
      PushNotification.scheduleExpiredNotification(Constants.AppConfig.hours_expired_left || 1);
      PushNotification.getRegistrationToken((pushToken: string) => {
        console.log('registerPushNotification ', pushToken);
        PushNotification.getDeviceId((deviceId: string) => {
          this.registerPushNotification(deviceId, pushToken);
        });
      });
    }, 50);
  }

  initNativeValues = async (token: string, _pathOnPremise: any, _accountSetting: any) => {
    const hostProfiling =  await HOST_PROFILING();
    const hostCallCenter = await HOST_CALL_CENTER();
    const hostAdmin = await HOST_ADM();

    MoCallCenter.setValue('TOKEN', token);
    MoCallCenter.setValue('STAFF_ID', Constants.StaffId);
    MoCallCenter.setValue('HOST_PROFILING', hostProfiling);
    MoCallCenter.setValue('MERCHANT_ID', Constants.MerchantId);
    MoCallCenter.setValue('HOST_CALL_CENTER', hostCallCenter);
    MoCallCenter.setValue('HOST_ADMIN', hostAdmin);
  }

  /**
   * register push token
   * @param deviceId
   * @param pushToken
   */
	registerPushNotification = async (deviceId: string, pushToken: string) => {
    const response = await AuthService.registerPushToken(pushToken, deviceId);
    console.log('registerPushNotification response ', response);
    if (response.code === 200) {
      Storage.setItem('PUSH_TOKEN', pushToken);
    }
  }

  hideKeyboard = () => {
    Keyboard.dismiss();
  }

  onLoginSubmitHandler = () => {
    this.hideKeyboard();
    if (!checkConnection()) {
      return;
    }
    if (this.validate()) {
      const password = this._passRef.getValue();
      const username = this._usernameRef.getValue();
      this.login(username, password);
    }
  }

  onResetPassHandler = () => {
    this.hideKeyboard();
  }

  onBackPressHandler = () => {
    Router.pop();
  }

  /**
   * handle user press finger button
   */
  onFingerPressHandler = () => {
    const { isTouchID  } = this.state;
    if (Constants.FingerStatus === 1) {
      this.showFingerprint();
      return;
    } 
    const modal = {
      content: <NotificationModal
        ignoreIcon={true}
        titleTextAlign={'left'}
        textAlign={'left'}
        title={'Thông báo'}
        content={`Vui lòng đăng nhập và kích hoạt đăng nhập bằng ${isTouchID ? 'vân tay' : 'FaceID' } trước khi sử dụng tính năng này.`}
        autoOpen={true}
        overlayClose={false}
        buttons={[{ name: 'Đóng' }]} />
    };
    pushModal(modal);
  }

  /**
   * show fingerprint
   */
  showFingerprint = () => {
    const { isTouchID } = this.state;

    if (Platform.OS === 'android') {
      MoFingerprint
        .authenticate({ title: 'Đăng nhập tài khoản qua vân tay', description: 'Sử dụng vân tay để đăng nhập vào tài khoản của bạn', cancelButton: 'Thoát',
          onAttempt: (erorr) => {
            console.log('onAttempt eror=', erorr);
          }
        })
        .then(() => {
          this.login(Constants.Username, Constants.Password);
          this.setState({isFingerFailed: true});
        })
        .catch((error) => {
          // console.log('FingerPrint errorname = ', error.name.name);
          if (error.name !== 'UserCancel') {
            this.setState({isFingerFailed: true});
            toast('Đăng nhập bằng vân tay quá số lần cho phép', 'error');
          }
        });
    }
    if (Platform.OS === 'ios') {
      MoFingerprint
      .authenticate({ description: 'Sử dụng vân tay để đăng nhập vào tài khoản của bạn', fallbackEnabled: true})
      .then(() => {
        this.login(Constants.Username, Constants.Password);
        this.setState({isFingerFailed: true});
      })
      .catch((error) => {
        if (error.name !== 'UserCancel' && error.name !== 'SystemCancel') {
          this.setState({isFingerFailed: true});
          toast(isTouchID ? 'Đăng nhập bằng vân tay thất bại' : 'Đăng nhập bằng FaceID thất bại', 'error');
        }
      });
    }
  }

  onContainerLayoutHandler = (e) => {
    if (!this.firstLoad) {
      return;
    }
		if (e && e.nativeEvent) {
			const height = e.nativeEvent.layout.height;
			this.setState({screenHeight: height});
      Constants.Height = height;
      this.firstLoad = false;
		}
	}

  render() {
    const { loading, isSensorAvailable, isTouchID, screenHeight } = this.state;
    return (
      <View style={{flex:1}}
        onLayout={this.onContainerLayoutHandler}>
        <KeyboardScrollView style={{ flex: 1}}>
          <View style={[styles.headerContainer,{height: screenHeight / 3 + 30}]}>
            <Image source={require('../../images/logo.png')} resizeMode={'stretch'} style={styles.logoImg} />
          </View>

          <View style={[styles.contentContainer,{height: screenHeight * 2 / 3}]}>
            <WrapText f={'b'} s={18} st={{ marginTop: 5, marginBottom: 5 }}>{'Xin chào,'}</WrapText>
            <WrapText f={'r'} s={12}>{'Điền tên tài khoản và mật khẩu để đăng nhập'}</WrapText>

            <FormEdit
              ref={comp => (this._usernameRef = comp)}
              readOnly={false}
              enable={true}
              value={''}
              label={'Tên tài khoản'}
              placeholder={'Nhập tên tài khoản'}
              emptyErrorMessage={'Tên tài khoản không được phép để trống'}
              containerStyle={{ marginTop: 25 }}
              autoCapitalize={'none'}
              autoValidate={false} />

            <FormEdit
              ref={comp => (this._passRef = comp)}
              readOnly={false}
              enable={true}
              value={''}
              label={'Mật khẩu'}
              placeholder={'Nhập mật khẩu'}
              emptyErrorMessage={'Mật khẩu không được phép để trống'}
              containerStyle={{ marginTop: 0 }}
              autoValidate={false}
              isPassword={true} />

              <WrapButton
                size={'m'}
                ref={ref => { this.loginBtnRef = ref; }}
                text={CommonLanguage.Login}
                textUpperCase={true}
                loading={loading}
                onPress={this.onLoginSubmitHandler}
                containerStyle={{marginTop: 15}}
                bold={true} />
            {isSensorAvailable &&
            <View style={styles.bottomContainer}>
              <WrapText st={[Styles.Text_S_R, {marginBottom: 0}]}>{`Đăng nhập bằng ${isTouchID ? 'vân tay' : 'FaceID'}`}</WrapText>
              <ButtonRipple 
                onPress={this.onFingerPressHandler}
                name={isTouchID ? 'login_fingerprint' : 'login_faceID'}
                color={Color.primary}
                size={50}
                width={80}
                height={80}
              />
            </View> }
          </View>

        </KeyboardScrollView>
        <View
            style={{
              position: 'absolute',
              top: 0,
              width: '100%',
              height: getStatusBarHeight(),
              backgroundColor: Platform.OS === 'android' ? 'transparent' : '#fff'
            }} />
      </View>
    );
  }
}

export default LoginContainer;
