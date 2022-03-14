import * as React from 'react';
import { View, StatusBar, Alert, StyleSheet, DeviceEventEmitter, EmitterSubscription, NativeEventEmitter, NativeModules, Platform, Linking } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import { Toast, Router, ModalContainer, Notification, ScreenType, NotificationModal, Spinner, IModal } from 'mo-app-comp';
import { CommonLanguage, toast, Constants, Color, Storage, Utils, StorageKeys, SocialService, logout, pushModal } from 'mo-app-common';
import { getStatusBarHeight } from 'react-native-status-bar-height';
import SplashScreen from 'react-native-splash-screen';
import SocketManager from './socket/socket';
import MoCallCenter from './services/stringee';
import PushNotification from './services/notification';
import { LoginScreen, MainScreen } from './screens';
import { ChatSocialDetailScreen, SocialNewsFacebookMainScreen, SocialNewsInstagramMainScreen } from 'mo-app-social';
import AuthService from './services/AuthService';
import jwt_decode from 'jwt-decode';
import RNExitApp from 'react-native-exit-app';

interface IAppMainState {
	loading: boolean;
	login_status: 0 | 1 | 2 | 3; // 1 chua login, 3 da login
	isSpinner: boolean;
}

class AppMain extends React.PureComponent<any, IAppMainState> {

	skipFirstToast: boolean;
	pushNoti: any;
	updateModalRef: any;

	notificationRef: Notification;

	// subscription
	loginSubscription: EmitterSubscription;
	logoutSubscription: EmitterSubscription;
	notificationSocialSub: EmitterSubscription;
	notificationSocialSub2: EmitterSubscription;

	constructor(props: any) {
		super(props);
		this.skipFirstToast = true;
		this.state = {
			loading: true,
			login_status: 0,
			isSpinner: false
		};

		this.loginSubscription = DeviceEventEmitter.addListener(Constants.EmitCode.Login, this.onLoginSuccessHandler);
		this.logoutSubscription = DeviceEventEmitter.addListener(Constants.EmitCode.Logout, this.onLogoutHandler);
		this.notificationSocialSub2 = DeviceEventEmitter.addListener('notificationSocialMessage', this.onDevicePushNotificationSocialHandler);
		const eventPushNotificationEmitter = new NativeEventEmitter(NativeModules.PushNotification);
		this.notificationSocialSub = eventPushNotificationEmitter.addListener('notificationSocialEvent', this.onNativePushNotificationSocialHandler);
		// init data
		this.initData();
	}

	async initData() {
		SplashScreen.hide();
		// if user logged then connect socket
		if (Constants.AuthToken) {
			SocketManager.connect();
		}
		await AuthService.getAppConfig();
		this.checkUpdateVersion();
	}

	checkUpdateVersion = () => {
		const updateVerState = Utils.checkIfNeedUpdateVersion(Platform.OS);
		if (updateVerState === 0) {
			return;
		}

		if (updateVerState === 1) {
			const modal: IModal = {
				content: <NotificationModal
					content={'Đã có phiên bản mới. Bạn có muốn cập nhật ngay.'}
					iconName={'error_connection'}
					iconColor={Color.primary}
					autoOpen={true}
					overlayClose={false}
					buttons={[{ name: 'Cập nhật' }, { name: 'Đóng' }]}
					onOk={this.onOkUpdateVersionHandler} />,
				isNotification: true
			};
			pushModal(modal);
			return;
		}

		if (updateVerState === 2) {
			const modal: IModal = {
				content: <NotificationModal
					content={'Phiên bản của bạn đã cũ. Bạn phải cập nhật lên phiên bản mới.'}
					iconName={'error_connection'}
					iconColor={Color.primary}
					autoOpen={true}
					autoClose={false}
					overlayClose={false}
					buttons={[{ name: 'Cập nhật' }, { name: 'Thoát' }]}
					onOk={this.onOkUpdateVersionHandler}
					onCancel={() => {
						RNExitApp.exitApp();
					}} />
			};
			pushModal(modal);
			return;
		}
	}

	onOkUpdateVersionHandler = () => {
		if (Platform.OS === 'android') {
			Linking.openURL('https://play.google.com/store/apps/details?id=com.mobio.cdp');
		}
		else {
			Linking.openURL('https://apps.apple.com/us/app/mobio-app/id1554978190');
		}
	}

	async componentDidMount() {
		setTimeout(() => {
			this.checkConnection();
		}, 0);
	}

	componentWillUnmount() {
		this.loginSubscription.remove();
		this.logoutSubscription.remove();
		this.notificationSocialSub.remove();
		this.notificationSocialSub2.remove();
	}

	checkConnection() {
		NetInfo.fetch().then((state: any) => {
			Constants.IsConnected = state.isConnected;
			if (!state.isConnected) {
				Alert.alert(CommonLanguage.Notification, CommonLanguage.noConnection);
			}
		});
	}

	onLoginSuccessHandler = () => {
		Utils.initGlobalData();
		SocketManager.connect();
	}

	onLogoutHandler = async (isExpiredToken: boolean) => {
		const { routes, mainTabIndex } = this.props;
		this.setState({ isSpinner: true });
		try {
			const pushToken = await Storage.getItem('PUSH_TOKEN');
			// Neu token chua qua han thi xoa push token va logout
			if (!isExpiredToken && !this.checkIfExpiredAuthToken()) {
				// delete pushToken
				if (pushToken) {
					const response =  await AuthService.deletePushToken(pushToken);
					if (!response.code || response.code === 401) {
						return;
					}
					if (response.code !== 200) {
						throw 'Error';
					}
				}
				// logout
				const logoutResponse = await AuthService.logout();
				if (!logoutResponse.code || logoutResponse.code === 401) {
					return;
				}
				if (logoutResponse.code !== 200) {
					throw 'Error';
				}
			}
			// clear native data
			MoCallCenter.clear();
			PushNotification.clear();
			// disconnect socket
			SocketManager.disconnect();
			Storage.clear();
			Storage.setItem(StorageKeys.FINGER_STATUS, Constants.FingerStatus);
			Storage.setItem(StorageKeys.PASSWORD, Constants.Password);
			Storage.setItem(StorageKeys.USER_NAME, Constants.Username);
			// reset data
			Constants.AuthToken = undefined;
			Constants.MerchantId = undefined;
			// Back to Login Screen
			Router.replace(<LoginScreen routes={routes} mainTabIndex={mainTabIndex} />);
		} catch (e) {
			toast('Có lỗi xẩy ra. Vui lòng kiểm tra lại kết nối mạng.');
		}
		this.setState({ isSpinner: false });
	}

	onConnectionChangeHandler = (state: any) => {
		Constants.IsConnected = state.isConnected;
		if (!state.isConnected) {
			this.skipFirstToast = false;
			return;
		}
		if (!this.skipFirstToast) {
			toast(CommonLanguage.InternetReconnect);
			return;
		}
		this.skipFirstToast = false;
	};

	onNativePushNotificationSocialHandler = (message: any) => {
		if (!Constants.AuthToken) {
			return;
		}
		if (!message || !message.data) {
			return;
		}
		const data: any = typeof message.data === 'string' ? JSON.parse(message.data) : message.data;
		this.handlePushNotificationSelect(data);
	}

	onDevicePushNotificationSocialHandler = (message: any) => {
		if (!Constants.AuthToken || !message) {
			return;
		}
		const data: any = typeof message === 'string' ? JSON.parse(message) : message;
		this.handlePushNotificationSelect(data);
	}

	handlePushNotificationSelect = (body: any) => {
		const featureType = SocialService.getFeatureTypeBySocialTypeSocket(body.socket_type);
		if (featureType !== Constants.SOCIAL.FEATURE_CODE.MESSAGE && featureType !== Constants.SOCIAL.FEATURE_CODE.COMMENT) {
			return;
		}
		let notificationData;
		if (body.socket_type === 'NEW_MESSAGE_SOCKET' || body.socket_type === 'NEW_COMMENT_SOCKET') {
			notificationData = SocialService.convertUserAssignFromSocket(body, featureType);
		}

		if (body.socket_type === 'ASSIGN_CONVERSATION_SOCKET' || body.socket_type === 'ASSIGN_COMMENT_SOCKET') {
			const typeAssign = body && body.data && body.data.assignee_type || '';
			if (!typeAssign || typeAssign === 'TEAM') {
				return;
			}
			if (!body || !body.data) {
				return;
			}
			notificationData = body.socket_type === 'ASSIGN_CONVERSATION_SOCKET' ? body.data.conversation : body.data.comment;
			notificationData.page_id = body.page_id;
			notificationData.social_type = body.social_type;
			notificationData.socket_type = body.socket_type;
		}
		this.processNotificationPress(notificationData);
	}

	processNotificationPress = async (body) => {
		if (!body) {
			return;
		}
		let assignment: any = {};
		let feature: any = {};
		const featureType = SocialService.getFeatureTypeBySocialTypeSocket(body.socket_type);
		if (featureType === Constants.SOCIAL.FEATURE_CODE.MESSAGE) {
			Router.replaceFrom(<ChatSocialDetailScreen
				assignment={assignment}
				notificationData={body}
				screenType={ScreenType.SOCIAL_DETAIL}
				feature={feature} />, { screenType: ScreenType.SOCIAL_DETAIL, id: body.id });
			return;
		}
		if (featureType === Constants.SOCIAL.FEATURE_CODE.COMMENT) {
			switch (body.social_type) {
				case Constants.SOCIAL.TYPE.FACEBOOK:
					Router.replaceFrom(<SocialNewsFacebookMainScreen
						assignment={assignment}
						notificationData={body}
						screenType={ScreenType.SOCIAL_NEWS}
						feature={feature} />, { screenType: ScreenType.SOCIAL_NEWS, id: assignment.id });
					break;
				case Constants.SOCIAL.TYPE.INSTAGRAM:
					Router.replaceFrom(<SocialNewsInstagramMainScreen
						assignment={assignment}
						notificationData={body}
						screenType={ScreenType.SOCIAL_NEWS}
						feature={feature} />, { screenType: ScreenType.SOCIAL_NEWS, id: assignment.id });
					break;
			}

		}
	}

	handleNotificationPress = async (data) => {
		this.notificationRef && this.notificationRef.hiddenToast();
		this.processNotificationPress(data);
	}

	checkIfExpiredAuthToken = () => {
		// await Utils.initGlobalData();
		if (!Constants.AuthToken) {
			return true;
		}
		const userInfo: any = jwt_decode(Constants.AuthToken);
		const date = new Date();
		const now = Math.ceil(date.getTime() / 1000);
		const delta = userInfo.exp - now;
		if (delta < 0) {
			return true;
		}
		return false;
	}

	onContainerLayoutHandler = (e) => {
		if (e && e.nativeEvent) {
			const height = e.nativeEvent.layout.height;
			Constants.Height = height;
			console.log('Screen Height = ', Constants.Height);
		}
	}

	render() {
		const { mainTabIndex, routes } = this.props;
		const { isSpinner } = this.state;
		const isExpired = this.checkIfExpiredAuthToken();
		const isLogIn = Constants.AuthToken && !isExpired ? true : false;
		// Neu token qua han -> logout
		if (isExpired && Constants.AuthToken) {
			logout();
		}
		return (
			<View style={styles.container} 
				onLayout={this.onContainerLayoutHandler}>
				<View
					style={{
						position: 'absolute',
						top: 0,
						width: '100%',
						height: getStatusBarHeight(),
						backgroundColor: 'transparent'
					}}>
					<StatusBar
						barStyle={'dark-content'}
						backgroundColor="#fff"
						translucent={true}
						hidden={false} />
				</View>

				<Router initialNode={isLogIn ? <MainScreen routes={routes} mainTabIndex={mainTabIndex} /> : <LoginScreen routes={routes} mainTabIndex={mainTabIndex} />} />

				<Notification
					ref={(comp) => { this.notificationRef = comp; }}
					onPress={this.handleNotificationPress} paddingHorizontal={20} />

				<ModalContainer />
				<Toast paddingHorizontal={20} />
				{ isSpinner && <Spinner />}
			</View>
		);
	}
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: Color.background,
	},
});

export default AppMain;
