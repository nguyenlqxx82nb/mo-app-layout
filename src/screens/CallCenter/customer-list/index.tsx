
import React from 'react';
import { View, Keyboard } from 'react-native';
import styles from './styles';
import { WrapText, ListView, AsyncImage, WrapButton, ButtonRipple, FormInput, pushModal, IModal, Router, ScreenType } from 'mo-app-comp';
import { Styles, Constants, Utils, Color, CustomIcon } from 'mo-app-common';
import CustomerService from '../../../services/CustomerService';
import PhoneListModal from './phone-list-modal';
import PhoneDetail from '../detail/';
import { callMobile, callCenter } from '../Utils/call';


interface ICustomerListProps {
}

interface ICustomerListState {
  callEnable: boolean;
}

export default class CustomerList extends React.PureComponent<ICustomerListProps, ICustomerListState> {

  lwRef: ListView;
  token: string;
  searchValue: string;
  searchInputRef: FormInput;

  constructor(props: ICustomerListProps) {
    super(props);
    this.searchValue = '';
    this.state = {
      callEnable: false
    };
  }

  /**
   * handle onload data
   * @param _page 
   * @param per_page 
   * @param onLoadDataCompleted 
   */
  onLoadDataHandler = async (_page: number, per_page: number, onLoadDataCompleted: any) => {
    if (this.searchValue) {
      const result = await CustomerService.findList(this.searchValue, Utils.validatePhone(this.searchValue) ? 'phone_number' :  Utils.validateEmail(this.searchValue) ? 'email' : 'name');
      if (this.searchValue !== result.searchValue) {
        return;
      }
      onLoadDataCompleted(result.data || []);
      return;
    }
    const result = await CustomerService.fetchList(this.searchValue, per_page);
    this.token = result.paging && result.paging.cursors && result.paging.cursors.after;
    // console.log('onLoadDataHandler data=', result.data);
    onLoadDataCompleted(result.data || []);
  }

  /**
   * handle onload more data
   * @param _page 
   * @param per_page 
   * @param onLoadDataMoreCompleted 
   * @returns 
   */
  onLoadMoreDataHandler = async (_page: number, per_page: number, onLoadDataMoreCompleted: any) => {
    if (this.searchValue) {
      //const result = await CustomerService.findList(this.searchValue,'name');
      onLoadDataMoreCompleted([]);
      return;
    }

    if (!this.token) {
      onLoadDataMoreCompleted([]);
      return;
    }
    const result = await CustomerService.fetchList(this.searchValue, per_page, this.token);
    this.token = result.paging && result.paging.cursors && result.paging.cursors.after;
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
    const enableCall = item.phone_number && item.phone_number.length;
    return (
      <ButtonRipple
        key={`key_${_index}`}
        color={Color.text}
        radius={5}
        onPress={() => { this.onProfilePressHandler(item); }}>
        <View style={[styles.rowItem, _index === 0 ? {marginTop : 12} : {}]}>
          <View style={Styles.RowCenter}>
            <AsyncImage source={{ uri: item.avatar }} width={36} height={36} radius={18} defaultAvatar={true} />
            <View style={{ marginLeft: 16 }}>
              <WrapText st={[Styles.Text_M_M, { maxWidth: 250 }]}>{item.name || '--'}</WrapText>
              <WrapText st={[Styles.Text_S_R, { color: Color.textSecondary }]}>{(item.phone_number.length && Utils.formatPhone(item.phone_number[0])) || '--'}</WrapText>
            </View>
          </View>
          <ButtonRipple
            enable={enableCall}
            name={'contact_call'}
            size={18} 
            width={36}
            height={36}
            color={Color.gray2}
            onPress={() => { this.onCallItemPressHandler(item); }} />

        </View>
        <View style={[styles.itemDivider, lastIndex ? { borderBottomWidth: 0 } : {}]} />
      </ButtonRipple>
    );
  }

  /**
   * handle press profile item
   * @param item 
   */
  onProfilePressHandler = (item: any) => {
    Keyboard.dismiss();
    Router.push(<PhoneDetail phoneNumber={item.phone_number.length && item.phone_number[0]} profileId={item.id}  />, {screenType: ScreenType.CALL_DETAIL})
  }

  /**
   * handle call press
   * @param item 
   */
  onCallItemPressHandler = (item: any) => {
    Keyboard.dismiss();
    const modal: IModal = {
      content: <PhoneListModal phone_number={item.phone_number}/>
    }
    pushModal(modal);
  }

  /**
   * do search
   */
  search = (forceSearch: boolean = false) => {
    const callEnable = Utils.validatePhone(this.searchValue);
    this.setState({
      callEnable: callEnable
    });
    const isNumner = Utils.validateNumber(this.searchValue);
    if (!callEnable && isNumner && !forceSearch) {
      return;
    }
    this.lwRef.performSearch(this.searchValue);
  }

  /**
   * handle search input submit
   * @param value 
   */
  onSearchSubmitHandler = async (value: string) => {
    this.searchValue = value;
    this.search(true);
  }

  /**
   * handle search input change
   * @param searchValue 
   */
  onSearchInputChangeHandler = (searchValue: string) => {
    setTimeout(() => {
      const currSearchValue = this.searchInputRef.getValue();
      if (searchValue === currSearchValue) {
        this.searchValue = searchValue;
        this.search();
      }
    }, 500);
  }

  /**
   * handle clear search
   */
  onClearSearchHandler = () => {
    this.searchValue = '';
    this.clearSearch();
    Keyboard.dismiss();
  }

  /**
   * clear search
   */
  clearSearch = () => {
    this.search();
  }

  render() {
    const { callEnable } = this.state;
    return (
      <View style={[styles.container]}>
        <View style={[Styles.RowCenter, {paddingTop: 12, paddingHorizontal: 16}]}>
          <FormInput
            ref={ref => { this.searchInputRef = ref; }}
            icon={'search'}
            placeholder={'Nhập tên, số điện thoại hoặc e-mail'}
            autoValidate={false}
            validRequire={false}
            onSubmit={this.onSearchSubmitHandler}
            onClearValue={this.onClearSearchHandler}
            containerStyle={{ marginBottom: 0, flex: 1, marginRight: 15 }}
            onChangeText={this.onSearchInputChangeHandler}
          />
          <ButtonRipple
            enable={callEnable}
            onPress={() => {callCenter(this.searchValue)}}>
            <View style={styles.callPhone}>
              <CustomIcon name={'call_centre'} size={16} color={Color.primary} />
            </View>
          </ButtonRipple>
        </View>

        <View style={{flexGrow: 1}}>
          <ListView
            ref={(comp: any) => { this.lwRef = comp; }}
            onRenderRow={this.renderRowItem}
            wr={Constants.Width}
            hr={60}
            autoH={true}
            top={0}
            bottom={20}
            pageSize={25}
            autoLoad={true}
            hasExtendedState={true}
            onLoad={this.onLoadDataHandler}
            onLoadMore={this.onLoadMoreDataHandler}
            icon={'work_done'}
            containerStyle={{ marginHorizontal: 0, paddingHorizontal: 0 }}
            loadAllMessage={'Đã xem hết'}
            noneItemsMsg={'Không có kết quả'}
            noneItem={
              <SearchNotFoundItem
                searchValue={this.searchValue}
                onCallCenterPress={() => {callCenter(this.searchValue);}}
                onCallPhonePress={() => {callMobile(this.searchValue);}}
              />}
            />
        </View>
        
      </View>
    )
  }

}

interface ISearchNotFoundItemProps {
  searchValue: string;
  onCallCenterPress: () => void;
  onCallPhonePress: () => void;
}
const SearchNotFoundItem = (props: ISearchNotFoundItemProps) => {
  const { onCallCenterPress, onCallPhonePress, searchValue } = props;
  if (!Utils.validatePhone(searchValue)) {
    return (
      <View style={[Styles.CenterItem, { paddingHorizontal: 32, width: Constants.Width }]}>
        <WrapText st={[Styles.Text_S_M, { textAlign: 'center', color: Color.textSecondary }]} nl={3}>{'Không có kết quả phù hợp'}</WrapText>
      </View>
    )
  }
  return (
    <View style={[Styles.CenterItem, { paddingHorizontal: 32, width: Constants.Width }]}>
      <WrapText st={[Styles.Text_S_M, { textAlign: 'center', color: Color.textSecondary }]} nl={3}>
        {'Số điện thoại bạn tìm không có trong hệ thống, bạn có muốn gọi số điện thoại này không?'}</WrapText>
      <WrapButton
        size={'m'}
        text={'Gọi qua tổng đài'}
        iconLeft={'call_centre'}
        type={'solid'}
        containerStyle={{ marginTop: 24 }}
        enable={true}
        onPress={onCallCenterPress}
      />
      <WrapButton
        size={'m'}
        text={'Gọi qua điện thoại'}
        iconLeft={'Calling'}
        type={'border'}
        containerStyle={{ marginTop: 24 }}
        textColor={Color.primary}
        active={true}
        enable={true}
        onPress={onCallPhonePress}
      />
    </View>
  );
};