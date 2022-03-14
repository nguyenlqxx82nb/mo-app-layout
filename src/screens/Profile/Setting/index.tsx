import { Color, Constants, Styles, pushModal, toast, Storage, StorageKeys, Device } from 'mo-app-common';
import { ButtonRipple, Router, WrapText } from 'mo-app-comp';
import React from 'react';
import { StyleSheet, Switch, View } from 'react-native';
import ConfirmModal from './Confirm';
import MoFingerprint from '../../../services/finger';

export default class SettingScreen extends React.PureComponent<any, any> {
	isTouchID: boolean;
	constructor(props: any) {
		super(props);
		this.state = {
			fingerStatus: Constants.FingerStatus === 1 ? true : false,
			isSensorAvailable: false,
		};
	}

	componentDidMount() {
		MoFingerprint
      .isSensorAvailable()
      .then(biometryType => {
				if (biometryType === 'Touch ID') {
					this.isTouchID = true;
				}
				this.setState({isSensorAvailable: true});
      })
      .catch(error => {
				this.setState({fingerStatus: false})
      });
	}

	/**
	 * back handler
	 */
	onBackHandler = () => {
		Router.pop();
	}

	onFingerPressHandler = () => {
		const { fingerStatus, isSensorAvailable } = this.state;
		if (!isSensorAvailable) {
			toast(Device.isIphoneX ? 'Thiết bị của bạn chưa kích hoạt chế độ sử dụng FaceId' : 'Thiết bị của bạn chưa kích hoạt chế độ sử dụng vân tay', 'warning');
			return;
		}
		// show confirm modal
		const modal = {
			content: <ConfirmModal
				isActive={!fingerStatus}
				onConfirmOk={() => {
					this.toggleFingerStatus();
				}} />
		};
		pushModal(modal);
	}

	toggleFingerStatus = () => {
		const { fingerStatus } = this.state;
		this.setState({
			fingerStatus: !fingerStatus
		});

		if (!fingerStatus) {
			Storage.setItem(StorageKeys.FINGER_STATUS, 1);
			Constants.FingerStatus = 1;
			toast(Device.isIphoneX ? 'Bạn đã bật chức năng đăng nhập qua FaceId thành công' : 'Bạn đã bật chức năng đăng nhập qua vân tay thành công', 'success');
		} else {
			Storage.setItem(StorageKeys.FINGER_STATUS, 0);
			Constants.FingerStatus = 0;
			toast(Device.isIphoneX ? 'Bạn đã tắt chức năng đăng nhập qua FaceId thành công' : 'Bạn đã tắt chức năng đăng nhập qua vân tay thành công', 'success');
		}
	}

	render() {
		const { fingerStatus } = this.state;
		return (
			<View style={[styles.container]}>
				<View style={[Styles.Header, { paddingLeft: 5, paddingRight: 0 }]}>
					<View style={[Styles.Row]}>
						<ButtonRipple name={'nav_back'} size={16} color={Color.text} onPress={this.onBackHandler} />
						<WrapText st={Styles.Text_XL_B} onPress={this.onBackHandler}>{'Trạng thái hoạt động'}</WrapText>
					</View>
				</View>
				<View style={{ marginTop: 20 }}>
					<View style={[Styles.Row, Styles.AlignCenter, Styles.JustifyBetween, { paddingHorizontal: 20, height: 40 }]}>
						<WrapText st={[Styles.Text_M_R]} >{Device.isIphoneX ? 'Dùng FaceId để đăng nhập' : 'Dùng vân tay để đăng nhập'}</WrapText>
						<Switch
							trackColor={{ false: Color.textSecondary, true: Color.green }}
							thumbColor={Color.background}
							ios_backgroundColor="#3e3e3e"
							value={fingerStatus}
							onValueChange={this.onFingerPressHandler}
						/>
					</View>
				</View>
			</View>
		);
	}

}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: Color.background
	},
	containerBottom: {
		borderTopLeftRadius: 20,
		borderTopRightRadius: 20,
		borderWidth: 0,
		flexGrow: 1,
		paddingTop: 20,
		paddingBottom: 10,
		flex: 1,
		width: Constants.Width,
		borderBottomWidth: 0
	}
});
