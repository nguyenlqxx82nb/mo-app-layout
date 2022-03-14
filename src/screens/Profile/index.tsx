import React from 'react';
import { View, TouchableOpacity, ImageBackground } from 'react-native';
import { Color, Styles, IUserInfo, JwtHelper, CustomIcon, logout, Constants } from 'mo-app-common';
import { WrapText, AsyncImage, Router } from 'mo-app-comp';
import styles from './styles';
import ActiveStatusScreen from './ActiveStatus';
import SettingScreen from './Setting';

interface IProfileScreenState {
  userInfo: IUserInfo,
  menuItems: mennuItem[]
}

interface mennuItem {
  icon: string;
  iconColor?: string;
  name: string;
  onPress?: () => void;
}
class ProfileScreen extends React.PureComponent<any, IProfileScreenState>{

  constructor(props: any) {
    super(props);
    this.state = {
      menuItems: [],
      userInfo: JwtHelper.decodeToken()
    };
  }

  componentDidMount() {
    this.initData();
  }

  initData = () => {
    const menuItems = [
      // {
      //   icon: 'Account',
      //   name: 'Thông tin tài khoản',
      // },
      {
        icon: 'setting',
        name: 'Cài đặt',
        onPress: this.onSettingPressHandler
      },
      {
        icon: 'active_state',
        name: 'Trạng thái hoạt động',
        onPress: this.onActiveStatusPressHandler
      },
      {
        icon: 'log_out',
        iconColor: Color.red,
        name: 'Đăng xuất',
        onPress: this.onLogoutPressHandler
      },
    ];
    this.setState({menuItems: menuItems});
  }

  /**
   * setting press handler
   */
  onSettingPressHandler = () => {
    Router.push(<SettingScreen />);
  }

  /**
   * active status press handler
   */
  onActiveStatusPressHandler = () => {
    Router.push(<ActiveStatusScreen />);
  }

  /**
   * logout press handler
   */
  onLogoutPressHandler = () => {
    logout();
  }

  render() {
    const { userInfo, menuItems } = this.state;
    console.log('userInfo ', userInfo, Constants.AuthToken);
    return (
      <View style={[styles.container]}>
        <View style={[Styles.Header]}>
          <WrapText f={'b'} s={18} >{'Tài khoản'}</WrapText>
        </View>

        <View style={[Styles.FlexGrow, Styles.AlignCenter]}>
          <ImageBackground source={require('../../images/account_bg.png')} style={[{width: Constants.Width, height: 215}, Styles.AlignCenter]}>
            <AsyncImage source={{ uri: userInfo.avatar }}
              width={70} height={70} radius={75} borderWidth={2} style={{ marginTop: 20 }}
              defaultAvatar={true} />

            <WrapText st={[Styles.Text_M_M, {marginTop: 10}]}>{userInfo.fullName || '--'}</WrapText>
            <WrapText st={[Styles.Text_S_R, {marginTop: 5}]}>{userInfo.email || '--'}</WrapText>
            {/* <WrapButton
              text={'Tài khoản Corporate'}
              type={'solid'}
              size={'s'}
              width={160}
              containerStyle={{marginTop: 20}}
            /> */}
          </ImageBackground>
          <View style={[styles.containerBottom, {borderWidth: 0.8, borderColor: Color.border}]}>
            {
              menuItems.map((menuItem, index) => {
                return (
                  <TouchableOpacity onPress={menuItem.onPress} key={index}>
                    <View style={[Styles.RowCenter, Styles.JustifyBetween, {paddingHorizontal: 20, paddingVertical:15}]}>
                      <View style={[Styles.RowCenter]}>
                        <CustomIcon name={menuItem.icon} size={20} color={ menuItem.iconColor ? menuItem.iconColor :  Color.primary} />
                        <WrapText st={[Styles.Text_M_M, {marginLeft: 10}]} >{menuItem.name}</WrapText>
                      </View>
                      <CustomIcon name={'nav_back'} size={16} color={Color.text} style={{transform: [{rotate: '180deg'}]}} />
                    </View>
                  </TouchableOpacity>
                );
              })
            }
          </View>
        </View>

      </View>
    );
  }
}

export default ProfileScreen;
