// import { Constants } from 'mo-app-common';
import { AppConfig, BaseService, BaseServiceMethod, Constants, HOST_ADM, JwtHelper } from 'mo-app-common';
import { Platform } from 'react-native';

class AuthenticationService extends BaseService {
	/**
	 * override api Path
	 */
	getApiPath = () => {
		return HOST_ADM();
	}

	/**
	 * login
	 * @param username
	 * @param password
	 */
	async login(username: string, password: string) {
		const body = { username: username, password: password };
		const headers = {
			Accept: 'application/json',
			'Content-Type': 'application/json',
		};
		const result = await this.fetch({
			path: 'login',
			method: BaseServiceMethod.POST,
			body: body,
			query: '&type_login=mobile',
			headers: headers,
		});
		return result;
	}

	/**
	 * check password
	 * @param username
	 * @param password
	 * @returns
	 */
	async checkPassword(username: string, password: string) {
		const body = { username: username, password: password };
		const result = await this.fetch({
			path: 'account/actions/check-password',
			method: BaseServiceMethod.POST,
			body: body
		});
		return result;
	}

	/**
	 * logout
	 * @returns
	 */
	async logout() {
		const result = await this.fetch({
			path: 'logout',
			method: BaseServiceMethod.POST,
			body: {
				type_login: 'mobile'
			}
		});
		return result;
	}

	/**
	 * register push token
	 * @param pushToken
	 * @param deviceId
	 * @returns
	 */
	async registerPushToken(pushToken: string, deviceId: string) {
		const host = await HOST_ADM();
		const userInfo = JwtHelper.decodeToken();
		const body = {
			device_operating_system: Platform.OS === 'ios' ? 'ios' : 'android',
			merchant_id: userInfo.merchantID,
			device_id: deviceId,
			account_id: userInfo.id,
			push_id: pushToken,
			sandbox: Platform.OS === 'ios' ? AppConfig.sandbox : true
		};
		const result = await this.fetch({
			hostApiPath: host,
			path: 'push-id',
			method: BaseServiceMethod.POST,
			body: body
		});
		return result;
	}

	/**
	 * delete token
	 * @param pushToken
	 * @returns
	 */
	async deletePushToken(pushToken: string) {
		const host = await HOST_ADM();
		const result = await this.fetch({
			hostApiPath: host,
			path: 'push-id',
			method: BaseServiceMethod.DELETE,
			query: `&push_ids=${pushToken}`
		});
		return result;
	}

	/**
	 * get app config
	 */
	async getAppConfig() {
		const date = new Date();
		const time = Math.ceil(date.getTime());
		const url = AppConfig.isPod ? 'https://app.mobio.vn/static/mobio_app_config.json' : 'https://app.mobio.vn/static/mobio_app_config_dev.json?t=' + time;
		const result = await this.fetch({
			hostApiPath: url,
			path: '',
			method: BaseServiceMethod.GET,
			returnResponseServer: true
		});
		Constants.AppConfig = result;
	}

	/**
	 * get Path
	 * @returns
	 */
	async getPathOnPremise() {
		return new Promise(async (resolve, reject) => {
			const headers = {
				Accept: 'application/json',
				'Content-Type': 'application/json',
			};

			const merchantId = Constants.MerchantId;
			if (!merchantId) {
				return reject();
			}
			const response = await this.fetch({
				path: `merchants/${merchantId}/public-configs`,
				method: BaseServiceMethod.GET,
				headers: headers,
				returnResponseServer: true
			});
			if (!response || !response.data) {
				return reject();
			}

			return resolve(response.data);

		});
	}
}

export default new AuthenticationService();