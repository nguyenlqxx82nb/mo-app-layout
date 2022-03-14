import React from 'react';
import { View, Image } from 'react-native';
import { WrapButton, WrapText, Router, Slide } from 'mo-app-comp';
import { Color, Constants, Device } from 'mo-app-common';
import styles  from './styles';

import { LoginScreen } from '../Login';

export class OnboardScreen extends React.PureComponent<any, any> {
    currIndex: number;
    slideRef: any;
    constructor(props: any) {
        super(props);
        const bottomHeight = Device.isIphoneX ? 150 + 30 : 130;
        const heightContent = Constants.Height - bottomHeight;
        this.state = {
            heightContent: heightContent,
        };
    }

    componentDidMount() {}

    onStartButtonPressHandler = () => {
        this.intoLoginScreen();
    }

    onNexStepPressHandler = () => {
        const { showNextStep } = this.state;
        if (!showNextStep) {
            this.slideRef.scrollBy(1);
            return;
        }
        
        this.intoLoginScreen();
    }

    onIndexSlideChanged = (index: number) => {
        if (index >= 2) {
            this.setState({
                showNextStep: true
            });
        }
    }

    intoLoginScreen() {
        const { initialNode, mainTabIndex } = this.props;
        Router.push(<LoginScreen initialNode={initialNode} mainTabIndex={mainTabIndex} />);
    }

    render() {
        const { heightContent } = this.state;
        return (
            <View style={[styles.container, {backgroundColor: Color.background}]}>
                    <View style={[styles.slideContainer, {height: heightContent}, {paddingTop: Constants.BarHeight + 40}]}>
                        <Slide
                            ref={ref => { this.slideRef = ref; }}
                            showsButtons={false}
                            dotColor={Color.gray}
                            activeDotColor={Color.text}
                            dotStyle={styles.dotStyle}
                            activeDotStyle={styles.dotStyle}
                            removeClippedSubviews={false}
                            paginationStyle={{bottom: 10}}
                            autoplay={false}
                            onIndexChanged={this.onIndexSlideChanged}>
                            {/* <View style={{flex: 1, alignItems: 'center'}}>
                                <WrapText f={'b'} s={20} lh={28} st={{marginHorizontal: 5, textAlign: 'center'}} nl={2} up={true}>{'quản lý chiến dịch marketing'}</WrapText>
                                <WrapText f={'r'} s={14} st={{marginTop: 20, textAlign: 'center'}} nl={3}>{'Theo dõi hoạt động và hiệu quả của các chiến dịch Marketing. Kích hoạt hoặc dừng các chiến dịch khi cần thiết'}</WrapText>
                                <View style={{flexGrow: 1, flex: 1, justifyContent: 'center', alignItems: 'center'}}>
                                    <Image source={require('../../images/s1.jpg')}
                                        style={{width: Constants.Width - 30}} 
                                        resizeMode={'contain'}/>
                                </View>
                            </View>
                            <View style={{flex: 1, alignItems: 'center'}}>
                                <WrapText f={'b'} s={20} st={{marginHorizontal: 5, textAlign: 'center'}} nl={2} up={true}>{'THEO DÕI CÁC CUỘC HỘI THOẠI'}</WrapText>
                                <WrapText f={'r'} s={14} st={{marginTop: 20, textAlign: 'center'}} nl={3} up={true}>{'Luôn theo dõi được các cuộc hội thoại mọi lúc, mọi nơi để có thể hỗ trợ khách hàng của bạn một cách thuận tiện nhất'}</WrapText>
                                <View style={{flexGrow: 1, flex: 1, justifyContent: 'center', alignItems: 'center'}}>
                                    <Image source={require('../../images/s2.jpg')}
                                        style={{width: Constants.Width - 30}} 
                                        resizeMode={'contain'}/>
                                </View>
                            </View>
                            <View style={{flex: 1, alignItems: 'center'}}>
                                <WrapText f={'b'} s={20} st={{marginHorizontal: 5, textAlign: 'center'}} nl={2} up={true}>{'GỌI ĐIỆN TRỰC TIẾP'}</WrapText>
                                <WrapText f={'r'} s={14} st={{marginTop: 20, textAlign: 'center'}} nl={3}>{'Tìm khách hàng bằng tên hoặc số điện thoại của khách hàng để liên hệ trực tiếp ngay trên ứng dụng'}</WrapText>
                                <View style={{flexGrow: 1, flex: 1, justifyContent: 'center', alignItems: 'center'}}>
                                    <Image source={require('../../images/s3.jpg')}
                                        style={{width: Constants.Width - 30}} 
                                        resizeMode={'contain'}/>
                                </View>
                            </View> */}
                        </Slide>
                    </View>
                    <View style={styles.bottomContainer}>

                        <WrapButton
                            textUpperCase={true}
                            text={'đăng nhập ngay'}
                            onPress={this.onStartButtonPressHandler}
                            containerStyle={[{marginTop: 0}]}
                            bold={true}/>
                        
                        <WrapButton
                            text={'Bỏ qua'}
                            type={'none'}
                            textColor={Color.text}
                            // iconRight={'continue'}
                            onPress={this.onNexStepPressHandler}
                            containerStyle={[{marginTop: 10}]}/>
                    </View>
                </View>
        );
    }
}
