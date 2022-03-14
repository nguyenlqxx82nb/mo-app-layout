import React, { PureComponent } from 'react';
import { View, BackHandler, Keyboard, StatusBar} from 'react-native';
import { connect } from 'react-redux';
import {Languages, toast, checkConnection, CustomIcon, Color, Constants } from '@common';
import { WrapButton, LoginInput, ResendButton, KeyboardScrollView, Header, Router, KeyType, KeyboardType, InputType } from '@components';
import styles from './styles';
import { AccountService } from '@services';

import { MainScreen } from '@screen';
class ResetPasswordScreen extends PureComponent<any, any> {
//   static propTypes = {
//     navigation: PropTypes.object,
//     onBack: PropTypes.func,
//     onViewHomeScreen: PropTypes.func
//   };

    _phoneNumber = '';
    phoneNumberRef: any;
    passRef: any;
    resendBtnRef: any;

    constructor(props: any) {
        super(props);

        this.state = {
            resendPass: '',
            step: 1,
            loading: false,
            resetLoading: false
        };
    }

    componentDidMount() {
        BackHandler.addEventListener('hardwareBackPress', this.handleBack);
    }

    componentWillUnmount() {
        BackHandler.removeEventListener('hardwareBackPress', this.handleBack);
    }

    onContinuePressHandler = () => {
        this.hideKeyboard();
        const { step } = this.state;
        if (step === 1) {
            const phoneValid = this.phoneNumberRef.validate();
            if (phoneValid.error) {
                toast(phoneValid.message);
                return false;
            }
            const phoneNumber = this.phoneNumberRef.getValue();
            this._phoneNumber = phoneNumber;
            this.fetchCodeResetPassword(phoneNumber);
            return;
        }
        if (step === 2) {
            const passValid = this.passRef.validate();
            if (passValid.error) {
                toast(passValid.message);
                return false;
            }
            this.resetPassword();
        }
    };

    onResendPressHandle = () => {
        this.hideKeyboard();
        this.fetchCodeResetPassword(this._phoneNumber);
    };

    handleBack = () => {
        Router.pop();
        return true;
    };

    fetchCodeResetPassword = async (phoneNumber: string) => {
        if (!checkConnection()) {
            return;
        }
        const { step } = this.state;
        if (step === 1) {
            this.setState({loading: true});
        } else {
            this.setState({resetLoading: true});
        }
        const response = await AccountService.getCodeResetPassword(phoneNumber);
        this.setState({resetLoading: false, loading: false});
        if (response && response.code === 200) {
            this.setState({ step: 2 }, () => {
                this.resendBtnRef.startTimeRemaining();
                setTimeout(() => {
                    toast(Languages.SendPassSMSSuccessful.replace('{phone}',phoneNumber), 'w');
                }, 500);
            });
            return;
        }
        if (response && response.code === 500) {
            toast(Languages.ProcessError);
            return;
        }
        toast(response.result.message);
    };

    resetPassword = async () => {
        this.setState({loading: true});
        const { login } = this.props;
        const password = this.passRef.getValue();
        const response = await AccountService.resetVerify(this._phoneNumber, password);
        this.setState({loading: false});
        if (response && response.code === 200) {
            Constants.DefaultAccount = false;
            login(response.result, response.result.token);
            Constants.OldPass = password;
            Router.replace(<MainScreen />);
            return;
        }
        if (response.code === 412) {
            toast(Languages.LoginIncorrect);
            return;
        }
        if (response.code === 500) {
            toast(Languages.ProcessError);
            return;
        }
        toast(response.result.message);
    };

    hideKeyboard = () => {
        Keyboard.dismiss();
    }

    render() {
        const { step, loading, resetLoading } = this.state;
        return (
            <View style={[styles.container]}>
                <KeyboardScrollView
                    style={[styles.contentContainer]}
                    extraScrollHeight={150}>
                    <View
                        style={{
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginTop: 45,
                            marginBottom: 30
                        }}>
                        <CustomIcon
                            name={'forgot_password'}
                            size={120}
                            style={{ color: Color.primary }}
                        />
                    </View>

                    <View style={styles.subContain}>
                        {step === 1 && (
                            <LoginInput
                                ref={comp => (this.phoneNumberRef = comp)}
                                placeHolder={Languages.PhoneNumber}
                                onSubmit={this.onContinuePressHandler}
                                emptyErrorMessage={Languages.PhoneEmpty}
                                phoneInvalidMessage={Languages.PhoneErrorValid}
                                icon={'phone_number'}
                                keyType={KeyType.go}
                                keyboardType={KeyboardType.phone}
                                type={InputType.phone} />
                        )}

                        {step === 2 && (
                            <LoginInput
                                ref={comp => (this.passRef = comp)}
                                placeHolder={Languages.NewPassPlh}
                                onSubmit={this.onContinuePressHandler}
                                emptyErrorMessage={Languages.PasswordEmpty}
                                icon={'password'}
                                keyType={KeyType.go}
                                password={true}
                                isTogglePassword={true}
                            />
                        )}

                        <WrapButton
                            loading={loading}
                            text={Languages.Continue}
                            containerStyle={{marginTop: 30 }}
                            onPress={this.onContinuePressHandler}
                        />

                        {   step === 2 && (
                            <ResendButton
                                loading={resetLoading}
                                containerStyle={{marginTop: 16}}
                                ref={comp => (this.resendBtnRef = comp)}
                                onPress={this.onResendPressHandle}
                            />
                        )}
                    </View>
                </KeyboardScrollView>

                <Header
                    title={Languages.ResetPassowrd}
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

const mapDispatchToProps = (dispatch: any) => {
    const { actions } = require('@redux/UserRedux');
    return {
        login: (user: any, token: any) => dispatch(actions.login(user, token))
    };
};

export default connect(null, mapDispatchToProps)(ResetPasswordScreen);
