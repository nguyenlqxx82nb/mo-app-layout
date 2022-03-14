
import React from 'react';
import { View } from 'react-native';
import styles from './styles';
import { WrapText, ListView, ButtonRipple, FormInput, pushModal, IModal } from 'mo-app-comp';
import { Styles, Constants, Utils, Color, toast, EmitKeys, CustomIcon } from 'mo-app-common';
import CustomerService from '../../../services/CustomerService';
import FilterModal, { ICallFilter } from './filter-modal';
import PhoneDetailModal from './detail-modal';
import { getCallType, getCallTypeIcon, getCallTypeName, convertCreateTime, getDefautlCallFilter } from '../Utils/call';
import moment from 'moment';
const cloneDeep = require('clone-deep');

interface ICustomerListProps {
}

export default class CallHistoryList extends React.PureComponent<ICustomerListProps, any> {

  lwRef: ListView;
  token: string;
  searchValue: string;
  searchInputRef: FormInput;
  callFillterData: ICallFilter;
  recoverEnable: boolean;

  constructor(props: ICustomerListProps) {
    super(props);
    this.searchValue = '';
    this.recoverEnable = false;
    this.callFillterData = getDefautlCallFilter();
    // console.log('callFillterData endDate=',this.callFillterData.endDate, 'stat date=', this.callFillterData.startDate);
  }

  

  /**
   * handle load data
   * @param page 
   * @param per_page 
   * @param onLoadDataCompleted 
   */
  onLoadDataHandler = async (page: number, per_page: number, onLoadDataCompleted: any) => {
    const filter = this.buildFilterQuery();
    const result = await CustomerService.fetchHistoryCallList(this.searchValue, per_page, page, false, filter);
    onLoadDataCompleted(result.data || []);
  }

  /**
   * handle load more data
   * @param page 
   * @param per_page 
   * @param onLoadDataMoreCompleted 
   */
  onLoadMoreDataHandler = async (page: number, per_page: number, onLoadDataMoreCompleted: any) => {
    const filter = this.buildFilterQuery();
    const result = await CustomerService.fetchHistoryCallList(this.searchValue, per_page, page, false, filter);
    onLoadDataMoreCompleted(result.data || []);
  }

  /**
   * render row
   * @param _type 
   * @param item 
   * @param _index 
   * @param lastIndex 
   * @returns 
   */
  renderRowItem = (_type: any, item: any, _index: number, lastIndex: boolean) => {
    let callType = getCallType(item);
    const iconType = getCallTypeIcon(callType);
    // console.log('renderRowItem ', item, ' callType=',callType);
    return (
      <ButtonRipple
        key={`key_${_index}`}
        color={Color.text}
        radius={5}
        onPress={() => { this.openDetailCallModal(item); }}>
        <View style={[styles.rowItem, _index === 0 ? {marginTop: 12} : {}]}>
          <View style={Styles.RowCenter}>
            <View style={{marginTop: 28}}>
              <CustomIcon name={iconType.name} size={13} color={iconType.color} />
            </View>
            <View style={{ marginLeft: 9.5 }}>
              <View style={[Styles.Row, {marginBottom: 5}]}>
                <WrapText st={[Styles.Text_M_M, { maxWidth: 150 }]}>{item.customer.name || item.customer_name || item.customer_phone_number || ' --'}</WrapText>
              </View>
              <WrapText st={[Styles.Text_S_R, { color: Color.textSecondary }]}>{getCallTypeName(callType)}</WrapText>
            </View>
          </View>

          <View style={Styles.RowCenter}>
            <WrapText st={[Styles.Text_S_R, {color: Color.textSecondary}]}>{convertCreateTime(item.time)}</WrapText>
          </View>

        </View>
        <View style={[styles.itemDivider, lastIndex ? { borderBottomWidth: 0 } : {}]} />
      </ButtonRipple>
    );
  }

  /**
   * open call detail
   * @param item 
   */
  openDetailCallModal = (item: any) => {
    const modal: IModal = {
      content: <PhoneDetailModal callData={item} />
    };

    pushModal(modal);
  }

  /**
   * search call by phone number or name
   */
  search = () => {
    this.lwRef.performSearch(this.searchValue);
  }

  /**
   * handle submit search
   * @param value 
   */
  onSearchSubmitHandler = async (value: string) => {
    this.searchValue = value;
    this.search();
  }

  /**
   * handle clear search
   */
  onClearSearchHandler = () => {
    this.searchValue = '';
    this.clearSearch();
  }

  /**
   * clear search
   */
  clearSearch = () => {
    this.searchValue = '';
    this.search();
  }

  /**
   * handle search input change
   * @param searchValue 
   */
  onSearchInputChangeHandler = (searchValue: string) => {
    setTimeout(() => {
      if (searchValue === this.searchInputRef.getValue()) {
        this.searchValue = searchValue;
        this.search();
      }
    }, 250);
  }

  /**
   * open filter modal
   */
  openFilterModal = () => {
    //console.log('openFilterModal recoverEnable=',this.recoverEnable,', callFillterData = ', this.callFillterData);
    const modal: IModal = {
      content: <FilterModal 
                  recoverEnable = {this.recoverEnable}
                  callFilterData={cloneDeep(this.callFillterData)}
                  onFilterSubmit = {this.handleFilterSubmit}
                  onFilterRecover = {this.handleFilterRecever} />
    };

    pushModal(modal);
  }

  /**
   * handle filter submit
   * @param filterData 
   */
  handleFilterSubmit = (filterData: ICallFilter) => {
    this.callFillterData = cloneDeep(filterData);
    // console.log('handleFilterSubmit filter=', this.callFillterData);
    this.search();
    this.recoverEnable = true;
  }

  /**
   * handle filter recover
   */
  handleFilterRecever = () => {
    this.callFillterData = cloneDeep(getDefautlCallFilter());
    this.recoverEnable = false;
    this.search();
  }

  /**
   * build query filter
   * @returns filter query
   */
  buildFilterQuery = () => {
    let queryFilter = '';
    if (this.callFillterData.callType) {
      queryFilter += `&type=${this.callFillterData.callType}`;
    }
    if (this.callFillterData.callState && this.callFillterData.callState.length) {
      queryFilter += `&call_status=${this.callFillterData.callState.join(',')}`;
    }
    if (this.callFillterData.callCenterNumber && this.callFillterData.callCenterNumber.length) {
      queryFilter += `&pbxnumber_id=${this.callFillterData.callCenterNumber.join(',')}`;
    }

    if (this.callFillterData.startDate) {
      queryFilter += `&start=${moment(this.callFillterData.startDate).format('YYYYMMDD')}000000`;
    }
    if (this.callFillterData.endDate) {
      queryFilter += `&end=${moment(this.callFillterData.endDate).format('YYYYMMDD')}235959`;
    }

    return queryFilter;
  }

  render() {
    return (
      <View style={[styles.container]}>
        <View style={[Styles.RowCenter, styles.searchContainer]}>
          <FormInput
            ref={ref => { this.searchInputRef = ref; }}
            icon={'search'}
            placeholder={'Nhập tên, số điện thoại'}
            autoValidate={false}
            validRequire={false}
            onSubmit={this.onSearchSubmitHandler}
            onClearValue={this.onClearSearchHandler}
            containerStyle={{ marginBottom: 0, flex: 1, marginRight: 5 }}
            onChangeText={this.onSearchInputChangeHandler}
          />

          <ButtonRipple 
            isPreventDoubleClick={true}
            onPress={this.openFilterModal}>
            <View style={styles.filterButton}>
              <CustomIcon name={'filter'} size={14} color={Color.primary}/>
              <WrapText st={[Styles.Text_S_SB, {marginLeft: 5, color: Color.primary}]} >{'Lọc'}</WrapText>
            </View>
          </ButtonRipple>
  
        </View>

        <View style={{flexGrow: 1}}>
          <ListView
            ref={(comp: any) => { this.lwRef = comp; }}
            onRenderRow={this.renderRowItem}
            wr={Constants.Width}
            hr={65}
            autoH={true}
            top={0}
            bottom={20}
            pageSize={25}
            autoLoad={true}
            hasExtendedState={true}
            onLoad={this.onLoadDataHandler}
            onLoadMore={this.onLoadMoreDataHandler}
            // icon={'work_done'}
            // loadingIcon={true}
            containerStyle={{ marginHorizontal: 0, paddingHorizontal: 0 }}
            loadAllMessage={'Đã xem hết'}
            noneItemsMsg={'Không có kết quả'} />
        </View>

      </View>
    )
  }

}
