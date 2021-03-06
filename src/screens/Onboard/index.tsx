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
                                <WrapText f={'b'} s={20} lh={28} st={{marginHorizontal: 5, textAlign: 'center'}} nl={2} up={true}>{'qu???n l?? chi???n d???ch marketing'}</WrapText>
                                <WrapText f={'r'} s={14} st={{marginTop: 20, textAlign: 'center'}} nl={3}>{'Theo d??i ho???t ?????ng v?? hi???u qu??? c???a c??c chi???n d???ch Marketing. K??ch ho???t ho???c d???ng c??c chi???n d???ch khi c???n thi???t'}</WrapText>
                                <View style={{flexGrow: 1, flex: 1, justifyContent: 'center', alignItems: 'center'}}>
                                    <Image source={require('../../images/s1.jpg')}
                                        style={{width: Constants.Width - 30}} 
                                        resizeMode={'contain'}/>
                                </View>
                            </View>
                            <View style={{flex: 1, alignItems: 'center'}}>
                                <WrapText f={'b'} s={20} st={{marginHorizontal: 5, textAlign: 'center'}} nl={2} up={true}>{'THEO D??I C??C CU???C H???I THO???I'}</WrapText>
                                <WrapText f={'r'} s={14} st={{marginTop: 20, textAlign: 'center'}} nl={3} up={true}>{'Lu??n theo d??i ???????c c??c cu???c h???i tho???i m???i l??c, m???i n??i ????? c?? th??? h??? tr??? kh??ch h??ng c???a b???n m???t c??ch thu???n ti???n nh???t'}</WrapText>
                                <View style={{flexGrow: 1, flex: 1, justifyContent: 'center', alignItems: 'center'}}>
                                    <Image source={require('../../images/s2.jpg')}
                                        style={{width: Constants.Width - 30}} 
                                        resizeMode={'contain'}/>
                                </View>
                            </View>
                            <View style={{flex: 1, alignItems: 'center'}}>
                                <WrapText f={'b'} s={20} st={{marginHorizontal: 5, textAlign: 'center'}} nl={2} up={true}>{'G???I ??I???N TR???C TI???P'}</WrapText>
                                <WrapText f={'r'} s={14} st={{marginTop: 20, textAlign: 'center'}} nl={3}>{'T??m kh??ch h??ng b???ng t??n ho???c s??? ??i???n tho???i c???a kh??ch h??ng ????? li??n h??? tr???c ti???p ngay tr??n ???ng d???ng'}</WrapText>
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
                            text={'????ng nh???p ngay'}
                            onPress={this.onStartButtonPressHandler}
                            containerStyle={[{marginTop: 0}]}
                            bold={true}/>
                        
                        <WrapButton
                            text={'B??? qua'}
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
