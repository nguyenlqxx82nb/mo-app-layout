import React from 'react';
import { View, DeviceEventEmitter } from 'react-native';
import { BottomTab, NotificationModal } from 'mo-app-comp';
import { Color, Constants, pushModal, Storage, StorageKeys } from 'mo-app-common';
import styles from './styles';
import CallCenterConfigService from '../../services/call-center/CallCenterConfig';
import CallCenterManager from '../../services/call-center/CallCenterManager';
import PushNotification from '../../services/notification';

class MainScreen extends React.PureComponent<any, any> {

	screens: any;
	tabRef: BottomTab;
	firstLoad: boolean;
	callCenterManager: CallCenterManager;

	constructor(props: any) {
		super(props);
		//const routes = this.initRoutes();
		this.state = {
			routes: props.routes,
			currIndex: props.mainTabIndex || 0,
			tabDisableIdx: []
		};
		this.firstLoad = true;
	}

	componentDidMount() {
		this.callCenterManager.init();
		this.initDisableTab();
		PushNotification.getSocialMessageData((message: string) => {
			if (message) {
				PushNotification.removeSocialMessageData();
				DeviceEventEmitter.emit('notificationSocialMessage', message);
			}
		});
	}

	initDisableTab = async () => {
		const { routes } = this.state;
		let tabDisableIdx = [];
		let isCallCenter: boolean = false;
		routes.forEach((route: any, index: number) => {
			if (!route.screen) {
				tabDisableIdx.push(index);
			}
		});
		// const userInfo: IUserInfo = await JwtHelper.decodeToken();
		// Constants.IsCallCenter = true;
		// if (!userInfo.statusUseCallCenter || userInfo.statusUseCallCenter !== 3) {
		// 	tabDisableIdx.push(1);
		// 	Constants.IsCallCenter = false;
		// } else {
		// }
		// get permission callcenter 
		const responseGetAccessTokenClient = await CallCenterConfigService.getAccessToken({ 'type': 1 });
		if (!responseGetAccessTokenClient || !responseGetAccessTokenClient.extension) {
			tabDisableIdx.push(1);
			Constants.IsCallCenter = false;
		} else {
			isCallCenter = true;
			// set callcenter tab
			this.setState({currIndex: 1});
			this.tabRef.setCurrentTabIndex(1);
		}
		console.log(' responseGetAccessTokenClient=', responseGetAccessTokenClient);
		const socialRoles = await Storage.getItem(StorageKeys.SOCIAL_ROLES);

		if (!socialRoles || !socialRoles.length) {
			tabDisableIdx.push(0);
			this.setState({
				tabDisableIdx: tabDisableIdx
			});
			return;
		} 
		// check social permission
		const allPaths = ['/social/facebook', '/social/instagram', '/social/zalo', '/social/youtube',
			'/social/chat/facebook', '/social/chat/instagram', '/social/chat/zalo', '/social/chat/youtube'];

		const findPermisionSocial = socialRoles.find(role => {
			return role && allPaths.includes(role.path);
		});
		if (!findPermisionSocial) {
			tabDisableIdx.push(0);
		} else if (!isCallCenter) {
			// set soccial tab
			this.setState({currIndex: 0});
			this.tabRef.setCurrentTabIndex(0);
		}
		//console.log('tabDisableIdx ', tabDisableIdx);
		this.setState({
			tabDisableIdx: tabDisableIdx
		});
	}

	componentWillUnmount() { }

	onRefreshHandler(index: number) {
		this.refresh(index);
	}

	onTabPressHandler = (route: any, selectedIndex: number) => {
		const routes = this.state.routes.map((item: any, index: number) => {
			if (index === selectedIndex && !route.notCache) {
				item.loaded = true;
			}
			return item;
		});
		this.setState({
			routes: routes,
			currIndex: selectedIndex
		});
		const moduleName = routes[selectedIndex].key;
		this.callCenterManager.updateCurrModule(moduleName);
	}

	refresh = (index: number) => {
		// this.tabRef.setCurrentIndex(index);
		this.setState({ currIndex: index });
	}

	onBottomTabPressHandler = (index: number) => {
		const { tabDisableIdx } = this.state;
		if (!tabDisableIdx.includes(index)) {
			return;
		}
		let content = 'Bạn không có quyền sử dụng chức năng này!';
		// if (index === 0 || index === 1) {	
		// 	content = 'Chức năng này sẽ được phát triển ở phiên bản sau!';
		// }
		if (index === 1) {
			content = 'Bạn không có quyền sử dụng chức năng gọi điện!';
		}
		const modal = {
			content: <NotificationModal
				content={content}
				iconName={'error_connection'}
				iconColor={Color.red}
				autoOpen={true}
				overlayClose={false}
				buttons={[{ name: 'Đóng' }]} />
		};
		pushModal(modal);
	}

	render() {
		const { routes, currIndex, tabDisableIdx } = this.state;
		Constants.Module = routes[currIndex].key;
		return (
			<View style={styles.container}>
				<View style={styles.innerContainer}>
					{
						routes.map((route: any, index: number) => {
							if (route.screen && (route.loaded || index === currIndex)) {
								if (!route.notCache) {
									route.loaded = true;
								}
								const zIndex = index === currIndex ? 20 : 0;
								return (
									<View key={`${route.key}`}
										style={[styles.fill, { zIndex: zIndex, backgroundColor: Color.background }]}>
										<View style={{ flex: 1 }}>
											{route.screen}
										</View>
									</View>
								);
							}
							return (<View key={`${route.key}`} />);
						})
					}
				</View>
				<BottomTab
					ref={ref => { this.tabRef = ref; }}
					initialIndex={currIndex}
					routes={routes}
					disableIndex={tabDisableIdx}
					activeTintColor={Color.primary}
					inactiveTintColor={Color.textSecondary}
					onPress={this.onTabPressHandler}
					onBottomTabPress={this.onBottomTabPressHandler}
				/>
				<CallCenterManager ref={ref => { this.callCenterManager = ref; }} />
			</View>
		);
	}
}

export default MainScreen;
