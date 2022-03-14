import { Utils, Constants, CacheKeys, Storage, BaseService, BaseServiceMethod, HOST_CALL_CENTER  } from 'mo-app-common';
import jwt_decode from 'jwt-decode';

const AccessTokenApi = '/access-token-api';
const AccessTokenClient = '/access-token-client';
class CallCenterConfigService extends BaseService {

	getApiPath = async () => {
		return HOST_CALL_CENTER();
	}

	/**
	 * get access token
	 * @param data object type = 1: accessToken, 2: accessAgentToken
	 */
	public getAccessToken = async (data: any) => {
		// await Utils.initGlobalData();
		try {
			// console.log('getAccessToken ', data);
			let checkExpired = false;
			let token;
			let keyCached;
			let cachedValue;
			const date = new Date();
			const time = Math.ceil(date.getTime());
			data.staff_id = Constants.StaffId;
			data.merchant_id = Constants.MerchantId;
			switch (data.type) {
				case 1:
					keyCached = CacheKeys.KEY_CACHE_CALL_CENTER + AccessTokenClient;
					break;
				case 2:
					keyCached = CacheKeys.KEY_CACHE_CALL_CENTER + AccessTokenApi;
					break;
				default:
					break;
			}
			cachedValue = await Storage.getItem(keyCached);
			// console.log('cachedValue=', cachedValue);
			if (cachedValue) {
				token = cachedValue.token;
				const dataToken: any = jwt_decode(token);
				checkExpired = time < dataToken.exp ? true : false;
			}

			if (!cachedValue || checkExpired) {
				const response = await this.fetch({
					path: `app/access_token`,
					method: BaseServiceMethod.POST,
					body: data,
				});
				// console.log('get access token ', response);
				if (response.code === 200) {
					Storage.setItem(keyCached, response.result.data);
					return response.result.data;
				}
				return false;
			}
			return cachedValue;
		} catch(e) {
			console.log(' error ', e);
			return undefined;
		}
		
		// const response = await this.fetch({
		// 	path: 'app/access_token',
		// 	method: BaseServiceMethod.POST,
		// 	body: data,
		// });
		// if (response.code === 200) {
		// 	Storage.setItem(keyCached, response.result.data);
		// 	return response.result.data;
		// }
		// return false;
	}

	public async getConfigs() {
		await Utils.initGlobalData();
		const response = await this.fetch({
			path: '/staff/configs',
			method: BaseServiceMethod.GET,
		});
		// console.log('data ', response);
		if (response.code === 200) {
			return response.result.configs;
		}

		return undefined;
	}
}



export default new CallCenterConfigService();