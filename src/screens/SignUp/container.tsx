
import React, { PureComponent } from 'react';
import {View, TouchableOpacity, BackHandler, Keyboard, StatusBar, Linking } from 'react-native';
import { connect } from 'react-redux';
import {Languages, Color, CustomIcon, toast, checkConnection, Cities, Constants } from '@common';
import { WrapButton, WrapText, LoginInput, ResendButton, KeyboardScrollView, Header, KeyType, KeyboardType, Router, InputType } from '@components';
import styles from './styles';
import { AccountService } from '@services';

import { MainScreen, WebViewScreen } from '@screen';

class SignUpContainer extends PureComponent<any, any> {

    phoneNumberRef: any;
    modal: any;
    resendBtnRef: any;
    passInputRef: any;
    nameRef: any;
    cccdRef: any;
    genderRef: any;
    birthDayRef: any;
    cityRef: any;
    isDuplicatePhone: boolean = false;
    headerRef: any;

    constructor(props: any) {
        super(props);
        this.state = {
            step: 1,
            phoneNumber: '',
            name: '',
            idCode: '',
            gender: 2,
            birthDay: '',
            loading: false,
            barColor: '#fff',
            idType: '',

            resendLoading: false
        };
    }

    componentDidMount() {
        BackHandler.addEventListener('hardwareBackPress', this.handleBack);
    }

    componentWillUnmount() {
        BackHandler.removeEventListener('hardwareBackPress', this.handleBack);
    }

    stopAndToast = (msg: string) => {
        this.setState({loading: false});
        toast(msg);
    };

    validate = () => {
        const nameValid = this.nameRef.validate();
        if (nameValid.error) {
            toast(nameValid.message);
            return false;
        }

        const phoneValid = this.phoneNumberRef.validate();
        if (phoneValid.error) {
            toast(phoneValid.message);
            return false;
        }

        const cccdValid = this.cccdRef.validate();
        if (cccdValid.error) {
            toast(cccdValid.message);
            return false;
        }

        const cityValid = this.cityRef.validate();
        if (cityValid.error) {
            toast(cityValid.message);
            return false;
        }

        const genderValid = this.genderRef.validate();
        if (genderValid.error) {
            toast(genderValid.message);
            return false;
        }

        const birthDayValid = this.birthDayRef.validate();
        if (birthDayValid.error) {
            toast(birthDayValid.message);
            return false;
        }
        return true;
    }

    onCancelHandle = () => {
        this.modal.open();
    };

    onContinuePressHandler = async () => {
        this.hideKeyboard();
        const { step } = this.state;
        let _step = step;
        if (_step === 1) {
            if (!this.validate()) {
                return;
            }
            _step = 2;
            const phone = this.phoneNumberRef.getValue();
            const name = this.nameRef.getValue();
            const cmt = this.cccdRef.getValue();
            const cmtType = this.cccdRef.getCmtType();
            const gender = this.genderRef.getValue();
            const birthDay = this.birthDayRef.getValue();
            const provinceCode = this.cityRef.getValue();

            this.setState({loading: true, phoneNumber: phone, name: name, idCode: cmt, idType: cmtType, gender: gender, birthDay: birthDay, provinceCode: provinceCode});
            this.registerPhone(phone, name, cmt, cmtType, gender, birthDay, provinceCode);
            return;
        }
        this.login();
    };

    registerPhone = async (phoneNumber: string, name: string = '', idCode: string = '', idType: string = '', gender: number = 2, birthDay: string = '', provinceCode: string = '') => {
        const { step } = this.state;
        const { type, accessToken, social } = this.props;

        let response;
        if (type === 'social') {
            response = await AccountService.verifyPhoneForSocial(social, accessToken, phoneNumber, birthDay, idCode, idType, name, gender, provinceCode);
        } else {
            response = await AccountService.registerUser(name, phoneNumber, idCode, idType, gender, birthDay, provinceCode);
        }
        // console.log('registerPhone ', name, idType, idCode, gender);
        this.setState({loading: false, resendLoading: false});
        if (response && response.code === 200) {
            if (step === 1) {
                this.setState({ step: 2, phoneNumber: phoneNumber } );
            }
            this.resendBtnRef.startTimeRemaining();
            setTimeout(() => {
                toast(Languages.SendPassSMSSuccessful.replace('{phone}', phoneNumber), 'w');
            }, 1000);
            return;
        }
        if (response.code === 500) {
            toast(Languages.ProcessError);
            return;
        }
        toast(response.result.message);
    }

    onResendPressHandler = async () => {
        this.hideKeyboard();
        const { phoneNumber, name, idCode, idType, gender, birthDay, provinceCode } = this.state;
        this.setState({resendLoading: true});
        this.registerPhone(phoneNumber, name, idCode, idType, gender, birthDay, provinceCode);
    }

    handleBack = () => {
        Router.pop();
        return true;
    }

    onCloseModalHandler = () => {}

    onOkModalHandler = () => {
        this.handleBack();
    }

    onLoginSubmitHandler = () => {
        this.hideKeyboard();
        const { type } = this.props;
        if (type !== 'social' || this.isDuplicatePhone) {
            this.login();
            return;
        }
        this.loginWithVerify();
    }

    validateLogin = () => {
        const passValid = this.passInputRef.validate();
        if (passValid.error) {
            toast(passValid.message);
            return false;
        }
        return true;
    }

    login = async () => {
        if (!checkConnection() || !this.validateLogin()) {
            return;
        }
        const { login } = this.props;
        const { phoneNumber } = this.state;
        const pass = this.passInputRef.getValue();

        this.setState({loading: true});
        const response = await AccountService.registerVerify(phoneNumber, pass);
        this.setState({loading: false});
        if (response && response.code === 200) {
            login(response.result, response.result.token);
            Constants.OldPass = pass;
            Router.replace(<MainScreen />);
            return;
        }
        if (response.code === 500) {
            toast(Languages.ProcessError);
            return;
        }
        toast('M???t kh???u kh??ng ch??nh x??c. Vui l??ng ki???m tra l???i');
    }

    loginWithVerify = async () => {
        if (!checkConnection() || !this.validateLogin()) {
            return;
        }
        const { social, accessToken, login } = this.props;
        const { phoneNumber } = this.state;
        const pass = this.passInputRef.getValue();
        this.setState({loading: true});
        const response = await AccountService.loginSocialVerifyPhone(social, accessToken, phoneNumber, pass);
        this.setState({loading: false});
        if (response && response.code === 200) {
            Constants.DefaultAccount = false;
            login(response.result, response.result.token);
            // navigation.replace('app');
            Router.replace(<MainScreen />);
            return;
        }
        if (response.code === 500) {
            toast(Languages.ProcessError);
            return;
        }
        toast(response.result.message);
        return;
    }

    onTermConditionHandle = () => {
        Router.push(<WebViewScreen title={'??i???u kho???n - ??i???u ki???n'} uri={'https://venesa.vn/dieu-khoan-dieu-kien-app-my-venesa/'} />);
    }

    hideKeyboard = () => {
        Keyboard.dismiss();
    }

    render() {
        const {
            step,
            phoneNumber,
            loading,
            resendLoading,
            barColor
        } = this.state;

        const { title } = this.props;

        return (
            <View style={[styles.container]}>
                <KeyboardScrollView
                    style={{flex: 1, paddingTop: Constants.HeaderHeight}}
                    extraScrollHeight={150}>

                    <View style={{ alignItems: 'center', justifyContent: 'center', marginTop: 30, marginBottom: 30 }}>
                        <CustomIcon name={'register'} size={100} style={{ color: Color.primary }} />
                    </View>

                    <View style={styles.subContain}>
                        {step === 2 &&
                            <View>
                                <View style={{ flex: 1, flexDirection: 'row', marginBottom: 10, justifyContent: 'space-between', alignItems: 'center' }}>
                                    <WrapText type={'t-s-l'} textStyle={{fontSize: 14}}>{Languages.PhoneNumber}</WrapText>
                                    {/* <TouchableOpacity
                                        onPress={this.onCancelHandle.bind(this)}>
                                        <WrapText type={'label'} textStyle={{ color: Color.red, marginLeft: 20 }}>{Languages.CancelRegister} </WrapText>
                                    </TouchableOpacity> */}
                                </View>
                                <WrapText textStyle={{ marginBottom: 20 }} type={'label'}>{phoneNumber}</WrapText>
                            </View>
                        }

                        { step === 1 &&
                            <View>
                                <LoginInput
                                    ref={comp => {this.nameRef = comp;}}
                                    containerStyle={{marginTop: 0}}
                                    placeHolder={'H??? v?? t??n'}
                                    onSubmit={this.onContinuePressHandler}
                                    emptyErrorMessage={'Vui l??ng nh???p h??? v?? t??n'}
                                    icon={'account'}
                                    keyType={KeyType.next}
                                    keyboardType={KeyboardType.default} />

                                <LoginInput
                                    ref={comp => {this.phoneNumberRef = comp;}}
                                    placeHolder={Languages.PhoneNumber}
                                    onSubmit={this.onContinuePressHandler}
                                    emptyErrorMessage={Languages.PhoneEmpty}
                                    phoneInvalidMessage={Languages.PhoneNumberValid}
                                    icon={'phone_number'}
                                    type={InputType.phone}
                                    keyType={KeyType.next}
                                    keyboardType={KeyboardType.numeric}/>

                                <LoginInput
                                    ref={comp => {this.cccdRef = comp;}}
                                    // placeHolder={'S??? CMND/CCCD'}
                                    onSubmit={this.onContinuePressHandler}
                                    // emptyErrorMessage={'Vui l??ng nh???p s??? CMND/CCCD'}
                                    // phoneInvalidMessage={Languages.PhoneNumberValid}
                                    icon={'ID_number'}
                                    type={InputType.cmt}
                                    keyType={KeyType.next}
                                    keyboardType={KeyboardType.numeric} />

                                <LoginInput
                                    ref={comp => {this.cityRef = comp;}}
                                    placeHolder={'T???nh th??nh'}
                                    emptyErrorMessage={'Vui l??ng ch???n t???nh th??nh'}
                                    onSubmit={this.onContinuePressHandler}
                                    icon={'address'}
                                    items={Cities}
                                    type={InputType.list}
                                />

                                <LoginInput
                                    ref={comp => {this.genderRef = comp;}}
                                    placeHolder={'Gi???i t??nh'}
                                    emptyErrorMessage={'Vui l??ng ch???n gi???i t??nh'}
                                    onSubmit={this.onContinuePressHandler}
                                    icon={'gender'}
                                    items={[
                                        {
                                            name:'N???',
                                            key: 3
                                        },
                                        {
                                            name:'Nam',
                                            key: 2
                                        },
                                    ]}
                                    type={InputType.radio}
                                    validType={5}
                                />

                                <LoginInput
                                    ref={comp => {this.birthDayRef = comp;}}
                                    placeHolder={'Sinh nh???t'}
                                    onSubmit={this.onContinuePressHandler}
                                    icon={'birthday'}
                                    type={InputType.date}
                                    validType={5} />

                                <WrapText type={'n-large'} textStyle={{ fontSize: 12, marginTop: 16 }} numberOfLines={3}>
                                    {'Nh???ng th??ng tin n??y s??? gi??p b???n tr??? th??nh th??nh vi??n v?? h?????ng quy???n l???i khi l?? th??nh vi??n c???a Venesa.'}
                                </WrapText>

                                <WrapButton
                                    text={Languages.Continue}
                                    containerStyle={{ marginTop: 30 }}
                                    loading={loading}
                                    onPress={this.onContinuePressHandler}/>
                            </View>
                        }

                        {step === 2 &&
                            <View>
                                <LoginInput
                                    ref={comp => {this.passInputRef = comp;}}
                                    placeHolder={'M???t kh???u'}
                                    onSubmit={this.onLoginSubmitHandler}
                                    emptyErrorMessage={Languages.PasswordEmpty}
                                    icon={'password'}
                                    keyType={KeyType.go}
                                    password={true}
                                    isTogglePassword={true}/>

                                <WrapButton
                                    loading={loading}
                                    text={Languages.Continue}
                                    containerStyle={{ marginTop: 30 }}
                                    onPress={this.onContinuePressHandler}/>

                                <ResendButton
                                    ref={comp => (this.resendBtnRef = comp)}
                                    containerStyle={{marginTop: 16}}
                                    loading={resendLoading}
                                    onPress={this.onResendPressHandler}
                                />
                            </View>
                        }

                        {step === 1 &&
                            <WrapText type={'n'} numberOfLines={5} textStyle={{marginTop: 20, paddingBottom: 50}}>
                                {'B???ng c??ch ????ng k?? t??i kho???n, b???n x??c nh???n ???? ?????c v?? ?????ng ?? v???i c??c'} {' '}
                                <WrapText type={'n-large-hl-bd'} textStyle={{ fontSize: 12 }} numberOfLines={2} onPress={this.onTermConditionHandle.bind(this)}>
                                    {'??i???u ki???n - ??i???u kho???n'}
                                </WrapText> {' '}
                                {'c???a Venesa'}
                            </WrapText>
                        }
                    </View>
                </KeyboardScrollView>

                <Header
                    ref={ref => {this.headerRef = ref;}}
                    title={ title ? title : Languages.signupAccount}
                    barColor={barColor}
                    onBack={this.handleBack.bind(this)} />

                <StatusBar
                    barStyle={'dark-content'}
                    backgroundColor="transparent"
                    translucent={true}
                    hidden={false} />
            </View>
        );
    }
}

// const mapStateToProps = (state: any) => {
//     return {};
// };

const mapDispatchToProps = (dispatch: any) => {
    const { actions } = require('@redux/UserRedux');
    return {
        login: (user: any, token: any) => dispatch(actions.login(user, token)),
    };
};

export default connect(undefined, mapDispatchToProps)(SignUpContainer);
