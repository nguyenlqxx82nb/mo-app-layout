import { Color, Constants, SocialService, Styles, toast } from 'mo-app-common';
import Languages from 'mo-app-common/src/Common/Languages';
import { ButtonRipple, Router, WrapText } from 'mo-app-comp';
import React from 'react';
import { StyleSheet, Switch, View } from 'react-native';

interface IActiveStatusScreenProps {

}

interface IActiveStatusScreenState {
	menuItems: menuItem[]
}

interface menuItem {
	type: string;
	title: string;
	note?: string;
	actionName: string;
	actionStatus: boolean;
	onPress?: (value) => void;
}

export default class ActiveStatusScreen extends React.PureComponent<IActiveStatusScreenProps, IActiveStatusScreenState> {

	constructor(props) {
		super(props);
		this.state = {
			menuItems: []
		};
	}

	componentDidMount() {
		this.initData();
	}

	initData = async () => {
		let socialStatus = false;
		const staffSetting = await SocialService.getStaffSetting(Constants.SOCIAL.ASSIGN_ACTIVE);
		if (staffSetting && staffSetting.code === '001' && staffSetting.data) {
			socialStatus = staffSetting.data.setting_status;
		}
		const data: menuItem[] = [
			// {
			//     type: 'CALL_CENTER',
			//     title: 'Tổng đài',
			//     actionName: 'Nhận cuộc gọi',
			//     actionStatus: true,
			//     onPress: this.onPressCallCenter,
			// },
			{
				type: 'SOCIAL',
				title: 'Online & Mạng xã hội',
				note: 'Cấu hình này sẽ áp dụng cho phân công bình luận, tin nhắn và đánh giá trên các trang mạng xã hội bạn được phân quyền.',
				actionName: 'Nhận phân công công việc ',
				actionStatus: socialStatus,
				onPress: this.onPressSocial,
			}
		];
		this.setState({ menuItems: data });
	}

	onPressSocial = async (status) => {
		const { menuItems } = this.state;
		const currentItem = menuItems.find(item => item.type === 'SOCIAL');
		if (!currentItem) {
			return;
		}
		const updateStaffSetting = await SocialService.setStaffSetting(Constants.SOCIAL.ASSIGN_ACTIVE, status);
		if (!updateStaffSetting || updateStaffSetting.code !== '001') {
			return toast(Languages.ManipulationUnSuccess, Constants.TOAST_TYPE.ERROR);
		}
		currentItem.actionStatus = status;
		this.setState({ menuItems: [...menuItems] });
	}

	onPressCallCenter = () => {

	}

	onBackHandler = () => {
		Router.pop();
	}

	handleValueChange = (e) => {
		console.log('e', e);
	}

	render() {
		const { menuItems } = this.state;
		const borderTopStyle = { marginTop: 20, borderTopWidth: 6, borderTopColor: Color.border };

		return (
			<View style={[styles.container]}>
				<View style={[Styles.Header, { paddingLeft: 5, paddingRight: 0 }]}>
					<View style={[Styles.Row]}>
						<View style={Styles.ButtonIcon}>
							<ButtonRipple name={'nav_back'} size={16} color={Color.text} onPress={this.onBackHandler} />
						</View>
						<WrapText st={Styles.Text_XL_B} onPress={this.onBackHandler}>{'Trạng thái hoạt động'}</WrapText>
					</View>
				</View>
				<View style={{}}>
					{
						menuItems.map((menuItem, index) => {
							return (
								<View style={[index !== 0 ? borderTopStyle : {}, { paddingHorizontal: 16 }]} key={index}>
									<WrapText styles={{ marginTop: 20 }} st={[Styles.Text_L_M]} >{menuItem.title}</WrapText>
									{
										!!menuItem.note &&
										<WrapText nl={10} styles={{ marginTop: 8 }} st={[Styles.Text_S_R]} c={Color.textSecondary} >{menuItem.note}</WrapText>
									}
									<View style={[Styles.Row, Styles.AlignCenter, Styles.JustifyBetween, { marginTop: 20 }]}>
										<WrapText st={[Styles.Text_M_R]} >{menuItem.actionName}</WrapText>
										<Switch
											trackColor={{ false: Color.textSecondary, true: Color.green }}
											thumbColor={Color.background}
											ios_backgroundColor="#3e3e3e"
											value={menuItem.actionStatus}
											onValueChange={menuItem.onPress}
										/>
									</View>
								</View>
							);
						})
					}
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
