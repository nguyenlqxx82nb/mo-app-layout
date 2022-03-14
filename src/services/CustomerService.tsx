
import { HOST_PROFILING, HOST_ADM, HOST_CALL_CENTER,  StorageKeys, BaseService, BaseServiceMethod,
	AdminService, CommonLanguage, toast, Constants, Utils } from 'mo-app-common';

class CustomerService extends BaseService {

	getApiPath = async () => {
		return await HOST_PROFILING();
	}

	public async getListAccountActive(query) {
		return await this.fetch({
			path: 'accounts',
			method: BaseServiceMethod.GET,
			query: query,
			returnResponseServer: true,
			keyCache: StorageKeys.CacheListAccountActive
		});
	}

	/**
	 * fetch list customer
	 * @param {string} search 
	 * @param {number} pageSize 
	 * @param {string} token 
	 * @returns list customer.
	 */
	public async fetchList(search: string = '', pageSize: number, token: string = '') {
		const profileGroups = await AdminService.fetchProfileGroups(true, true);
		if (profileGroups.code !== 200) {
			toast(CommonLanguage.ProcessError);
		}
		const profile_group = profileGroups.data.map(item => item.id);
		// const profile_group = ["0b1da771-0e4f-41a3-9ce2-bc0d43cee8cc", "d3509961-84bf-4ea9-a2a5-9fd423c0d3bc"];
		// console.log('profile_group ', profile_group);
		const result = await this.fetch({
			path: `merchants/${Constants.MerchantId}/customers/actions/list`,
			method: BaseServiceMethod.POST,
			query: `&per_page=${pageSize}&after_token=${token}`,
			returnResponseServer: true,
			body: {
				search: search,
				profile_filter: [],
				profile_group: profile_group,
				fields: ['name', 'primary_phone', 'avatar', 'secondary_phones']
			},
			response: {
				item: {
					id: 'id',
					avatar: 'avatar',
					name: 'name',
					email: (_item: any) => {
						const email = (_item.primary_email && _item.primary_email.email) || '--';
						return email;
					},
					phone_number: (_item: any) => {
						const phone_number = [];
						if(_item.primary_phone && _item.primary_phone.phone_number) {
							phone_number.push(_item.primary_phone.phone_number);
						}

						if(_item.secondary_phones && _item.secondary_phones.secondary && _item.secondary_phones.secondary.length) {
							for (let i=0; i< _item.secondary_phones.secondary.length; i++) {
								phone_number.push(_item.secondary_phones.secondary[i].phone_number);
							}
						}
						return phone_number;
					},
					encrypt: (_item: any) => {
						return _item && _item.primary_phone && _item.primary_phone.encrypt;
					},
				},
			}
		});
		return result;
	}

	/**
	 * find customer by condition
	 * @param search 
	 * @param {string} condition // name, phone_number, email, customer_id, cif
	 * @returns 
	 */
	public async findList(search: string = '', condition: 'name' | 'phone_number' | 'email' | 'customer_id' | 'cif' = 'name') {
		const profileGroups = await AdminService.fetchProfileGroups(true, true);
		if (profileGroups.code !== 200) {
			toast(CommonLanguage.ProcessError);
		}
		const profile_group = profileGroups.data.map(item => item.id);
		// const profile_group = ["0b1da771-0e4f-41a3-9ce2-bc0d43cee8cc", "d3509961-84bf-4ea9-a2a5-9fd423c0d3bc"];
		// console.log('findList profile_group ', profile_group);
		const result = await this.fetch({
			path: `profile/find_by_condition`,
			method: BaseServiceMethod.POST,
			returnResponseServer: true,
			body: {
				condition: {'find_by': condition, value:[search]},
				profile_group: profile_group,
				fields: ['name', 'email', 'phone_number', 'profile_id', 'avatar', 'primary_phone', 'secondary_phones']
			},
			response: {
				item: {
					id: 'id',
					avatar: 'avatar',
					name: 'name',
					emails: (_item: any) => {  return _item.email},
					email: (_item: any) => {
						const email = (_item.email && _item.email.length && _item.email[0]) || '--';
						return email;
					},
					phone_number: (_item: any) => {  return _item.phone_number},
					// encrypt: (_item: any) => {  return _item.phone_number},
					// phone_number: (_item: any) => {
					// 	const phone_number = [];
					// 	if(_item.primary_phone && _item.primary_phone.phone_number) {
					// 		phone_number.push(_item.primary_phone.phone_number);
					// 	}

					// 	if(_item.secondary_phones && _item.secondary_phones.secondary && _item.secondary_phones.secondary.length) {
					// 		for (let i=0; i< _item.secondary_phones.secondary.length; i++) {
					// 			phone_number.push(_item.secondary_phones.secondary[i].phone_number);
					// 		}
					// 	}
					// 	return phone_number;
					// },
					encrypt: (_item: any) => {
						return _item && _item.primary_phone && _item.primary_phone.encrypt;
					},
				},
			}
		});
		result.searchValue = search;
		return result;
	}



	/**
	 * search user
	 * @param search 
	 * @returns 
	 */
	public async searchUser(search?: { query?: string, social_id?: string, social_type?: string, lang?: string }) {
		const { query, social_id, social_type } = search;
		const params: any = {};
		if (query && query.length > 0) {
			params.query = query;
		}
		if (social_id && social_id.length > 0) {
			params.social_id = social_id;
			params.social_type = social_type;
		}
		params.merchant_id = Constants.MerchantId;
		const response = await this.fetch({
			path: 'search-users',
			method: BaseServiceMethod.GET,
			query: params,
			response: {
				dataKey: 'customers',
				item: {
					id: 'id',
					avatar: 'avatar',
					name: 'name',
					email: (_item: any) => {
						const email = (_item.primary_email && _item.primary_email.email) || '--';
						return email;
					},
					phone_number: (_item: any) => {
						const phone_number = [];
						if(_item.primary_phone && _item.primary_phone.phone_number) {
							phone_number.push(_item.primary_phone.phone_number);
						}

						if(_item.secondary_phones && _item.secondary_phones.secondary && _item.secondary_phones.secondary.length) {
							for (let i=0; i< _item.secondary_phones.secondary.length; i++) {
								phone_number.push(_item.secondary_phones.secondary[i].phone_number);
							}
						}
						return phone_number;
					},
					encrypt: (_item: any) => {
						return _item && _item.primary_phone && _item.primary_phone.encrypt;
					},
				},
			}
		});
		return response;
	}

	/**
	 * fetch customer by profileIds
	 * @param profileIds 
	 */
	fetchByProfileIds = async (profileIds: string[]) => {
		const response = await this.fetch({
			path: 'profile/search_by_profile_ids',
			method: BaseServiceMethod.POST,
			body: {
				profile_ids: profileIds
			},
			response: {
				dataKey: 'data',
				item: {
					id: 'id',
					avatar: 'avatar',
					name: 'name',
					email: (_item: any) => {
						const email = (_item.primary_email && _item.primary_email.email) || '--';
						return email;
					},
					phone_number: (_item: any) => {
						const phone_number = [];
						if(_item.primary_phone && _item.primary_phone.phone_number) {
							phone_number.push(_item.primary_phone.phone_number);
						}

						if(_item.secondary_phones && _item.secondary_phones.secondary && _item.secondary_phones.secondary.length) {
							for (let i=0; i< _item.secondary_phones.secondary.length; i++) {
								phone_number.push(_item.secondary_phones.secondary[i].phone_number);
							}
						}
						return phone_number;
					},
					encrypt: (_item: any) => {
						return _item && _item.primary_phone && _item.primary_phone.encrypt;
					},
				},
			}
		});
		return response;
	}

	/**
	 * decrypt email
	 * @param body 
	 * @returns 
	 */
	decryptEmailPhone = async (body: any) => {
		const apiPath = await HOST_ADM();
		return await this.fetch({
			hostApiPath: apiPath,
			body: body,
			path: 'merchants/actions/decrypt',
			method: BaseServiceMethod.POST,
			returnResponseServer: true,
		});
	}

	/**
	 * fetch history call list
	 * @param {string} search 
	 * @param {number} per_page 
	 * @param {number} page 
	 * @param {string} profileIds
	 * @param {boolean} isGetProfile
	 * @param {string} filter
	 * @returns 
	 */
	public async fetchHistoryCallList(search: string = '', per_page: number, page: number, isGetProfile: boolean, filter?: string, profileIds?: string) {
		const host = await HOST_CALL_CENTER();
		const filterQuery = filter ? `${filter}` : '';
		let query = `&sort=time&staff_id=${Constants.UserId}&search=${search}&page=${page}&per_page=${per_page}&get_profile=${isGetProfile?'new':''}${filterQuery}`;
		if (profileIds) {
			query = `${query}&profile_id=${profileIds}`
		}
		// console.log('fetchHistoryCallList ', query);
		const result = await this.fetch({
			hostApiPath: host,
			path: `app/call/list_call`,
			method: BaseServiceMethod.GET,
			query: query,
			returnResponseServer: true,
		});
		return result;
	}

	/**
	 * fetch list Pbxnumber
	 * @returns 
	 */
	public async fetchPbxnumber() {
		const host = await HOST_CALL_CENTER();
		const result = await this.fetch({
			hostApiPath: host,
			path: `setting/pbxnumber`,
			method: BaseServiceMethod.GET,
			query: '',
			returnResponseServer: true,
			keyCache: 'CachePbxnumber'
		});
		return result;
	}

	
}

export default new CustomerService();
