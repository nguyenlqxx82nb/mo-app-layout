import React from 'react';
import { View, ScrollView } from 'react-native';
import { WrapModal, WrapText, ButtonRipple, Radio, IRadioItem, Checkbox, WrapButton, FormDate, ICheckBoxItem } from 'mo-app-comp';
import { Styles, Color, Constants } from 'mo-app-common';
import CustomerService from '../../../../services/CustomerService';
import { getDefautlCallFilter } from '../../Utils/call';
import moment from 'moment';
import styles from './styles';
const cloneDeep = require('clone-deep');

export interface ICallFilter {
  callType?: 'inbound' | 'outbound' | null,
  callCenterNumber?: string[];
  callState?: string[];
  startDate?: any;  
  endDate?: any;
}

interface IFilterModalProps {
  recoverEnable: boolean;
  callFilterData: ICallFilter;
  onFilterSubmit: (callFilterData: ICallFilter) => void;
  onFilterRecover: () => void;
}

interface IFilterModalState {
  callFilterData: ICallFilter;
  centerNumberData: ICheckBoxItem[];
  recoverEnable: boolean;
  callStatusData: ICheckBoxItem[];
}

export default class FilterModal extends React.Component<IFilterModalProps, IFilterModalState> {

  wrapModalRef: WrapModal;
  callTypeData: IRadioItem[];

  constructor(props: IFilterModalProps) {
    super(props);
    this.initData();
    this.state = {
      callFilterData: props.callFilterData,
      centerNumberData: [],
      recoverEnable: props.recoverEnable,
      callStatusData: this.getCallStatusData(props.callFilterData.callType)
    }
  }

  componentDidMount() {
    this.fetchPbxnumber();
  }

  /**
   * generate callstatus data 
   * @param callType 
   * @returns 
   */
  getCallStatusData = (callType: 'inbound' | 'outbound' | null = null) => {
    if (callType === null || callType === 'outbound') {
      return [
        {
          labelRight: 'Đã nghe',
          value: 'listen',
          active: false
        },
        {
          labelRight: 'Từ chối nghe',
          value: 'reject',
          active: false
        },
        {
          labelRight: 'Gọi nhỡ',
          value: 'miss',
          active: false
        },
      ];
    }

    return  [
      {
        labelRight: 'Đã nghe',
        value: 'listen',
        active: false
      },
      {
        labelRight: 'Gọi nhỡ',
        value: 'miss',
        active: false
      },
    ];
  }

  /**
   * init data
   */
  initData = () => {
    this.callTypeData = [
      {
        id : 'inbound',
        labelRight: 'Cuộc gọi đến'
      },
      {
        id: 'outbound',
        labelRight: 'Cuộc gọi đi'
      }
    ];
  }

  /**
   * fetch PBXnumber
   */
  fetchPbxnumber = async () => {
    const response = await CustomerService.fetchPbxnumber();
    if (response.code !== 200) {
      return;
    }

    let pbxnumberList: any[] = response.data.map((item: any, index: number) => {
      return {
        value: item._id,
        labelRight: item.pbx_number,
        active: false
      }
    });
    pbxnumberList = pbxnumberList.filter( (item:any) => {
      if (item.labelRight === 'ADAPTIVENUMBER') {
        return false;
      }
      return true;
    });
    // console.log('fetchPbxnumber callFilterData=',this.props.callFilterData );
    this.setState({
      centerNumberData: pbxnumberList,
      // callFilterData: this.props.callFilterData
    })
  }

  /**
   * close modal
   */
  close = () => {
    this.wrapModalRef.close();
  }

  /**
   * handle call type changed
   * @param {IRadioItem} item 
   */
  handleCallTypeChanged = (item: IRadioItem) => {
    const { callFilterData } = this.state;
    callFilterData.callType = item ? item.id : null;
    callFilterData.callState = [];
    const callSatusData = this.getCallStatusData(callFilterData.callType);
    this.setState({
      callFilterData: callFilterData,
      recoverEnable: true,
      callStatusData: callSatusData
    });
  }

  /**
   * handle center number changed
   * @param {boolean} active 
   * @param {string} value 
   */
  handleCenterNumberSelectChanged = (active: boolean, value: any) => {
    const { callFilterData } = this.state;
    const centerNumbers = callFilterData.callCenterNumber;
    const index = centerNumbers.indexOf(value);
    if (index >= 0) {
      centerNumbers.splice(index, 1);
    }
    
    if (active) {
      centerNumbers.push(value);
    }

    callFilterData.callCenterNumber = centerNumbers;
    this.setState({
      callFilterData: callFilterData,
      recoverEnable: true
    });
  }

  /**
   * handle call state select changed
   * @param {boolean} active 
   * @param {string} value 
   */
  handleCallStateSelectChanged = (active: boolean, value: any) => {
    const { callFilterData } = this.state;
    const callState = callFilterData.callState;
    const index = callState.indexOf(value);
    if (index >= 0) {
      callState.splice(index, 1);
    }
    
    if (active) {
      callState.push(value);
    }

    callFilterData.callState = callState;
    this.setState({
      callFilterData: callFilterData,
      recoverEnable: true
    });
  }

  /**
   * handle start date selected
   * @param {Date} date 
   */
  handleStartDatePicked = (date: Date) => {
    const { callFilterData } = this.state;
    callFilterData.startDate = date;
    this.setState({
      recoverEnable: true
    });
  }

  /**
   * handle endDate selected
   * @param date 
   */
  handleEndDatePicked = (date: Date) => {
    const { callFilterData } = this.state;
    callFilterData.endDate = date;
    this.setState({
      recoverEnable: true
    });
  }

  /**
   * handle filter submit
   */
  handleFilterSubmit = () => {
    const { recoverEnable } = this.state;
    if (recoverEnable) {
      this.props.onFilterSubmit(this.state.callFilterData);
    } else {
      this.props.onFilterRecover();
    }
    this.close();
  }

  /**
   * handle filter recover
   */
  handleFilterRecover = () => {
    this.setState({
      recoverEnable: false,
      callFilterData: cloneDeep(getDefautlCallFilter())
    });
  }

  render() {
    const { callFilterData, centerNumberData, recoverEnable, callStatusData } = this.state;
    // console.log('render callFilterData ', callFilterData);
    const startDate = callFilterData.startDate && moment(callFilterData.startDate).toDate();
    const endDate = callFilterData.endDate && moment(callFilterData.endDate).toDate();
    return(
      <WrapModal
        ref={(ref) => {this.wrapModalRef = ref;}}
        autoOpen={true}
        position={'bottom'}>
        <View style={styles.container}>
          <View style={styles.header}>
            <WrapText st={[Styles.Text_L_B]}>{'Bộ lọc'}</WrapText>
            <ButtonRipple 
              onPress={this.close}
              name={'close'}
              size={16}
              color={Color.text}
              width={40}
              height={40}
            />
          </View>
          <View style={[styles.contentContainer, {height: Constants.Height - Constants.BarHeight - 50 - 60}]}>
            <ScrollView 
              style={{flexGrow: 1}}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 15 }}>

              <View style={styles.filterItem}>
                <WrapText st={[Styles.Text_M_M, styles.filterItemTitle]}>{'Lịch sử cuộc gọi'}</WrapText>
                <Radio
                  items={this.callTypeData}
                  selectedKey={callFilterData.callType}
                  isRequired={false}
                  onSelectedChange={this.handleCallTypeChanged} />
              </View>

              <View style={styles.filterItem}>
                <WrapText st={[Styles.Text_M_M, styles.filterItemTitle]}>{'Tổng đài'}</WrapText>
                {
                  centerNumberData.map((centerNumberItem, index)=> {
                    return (
                      <Checkbox 
                        labelRight={centerNumberItem.labelRight} 
                        value={centerNumberItem.value} 
                        active={callFilterData.callCenterNumber.includes(centerNumberItem.value) ? true : false}
                        onActiveChange={this.handleCenterNumberSelectChanged} />
                    )
                  })
                }
              </View>

              <View style={styles.filterItem}>
                <WrapText st={[Styles.Text_M_M, styles.filterItemTitle]}>{'Trạng thái cuộc gọi'}</WrapText>
                {/* <Checkbox labelRight={'Đã nghe'} key={'listen'} />
                <Checkbox labelRight={'Gọi nhỡ'} key={'reject,miss'} /> */}
                {
                  callStatusData.map((callStatusItem, index)=> {
                    return (
                      <Checkbox 
                        labelRight={callStatusItem.labelRight} 
                        value={callStatusItem.value} 
                        active={callFilterData.callState.includes(callStatusItem.value) ? true : false} 
                        onActiveChange={this.handleCallStateSelectChanged}/>
                    )
                  })
                }
              </View>

              <View style={[styles.filterItem, {borderBottomWidth: 0}]}>
                <WrapText st={[Styles.Text_M_M, styles.filterItemTitle]}>{'Thời gian'}</WrapText>
                <View style={styles.durationDate}>

                  <FormDate 
                    date={startDate} 
                    maxDate={callFilterData.endDate && moment(callFilterData.endDate).toDate()} 
                    containerStyle={{}} 
                    onDatePicked={this.handleStartDatePicked}/>

                  <WrapText st={[Styles.Text_S_R, {color:Color.textSecondary, marginHorizontal: 15}]}>{'đến'}</WrapText>

                  <FormDate 
                    date={endDate}
                    minDate={callFilterData.startDate && moment(callFilterData.startDate).toDate()}
                    onDatePicked={this.handleEndDatePicked}/>
          
                </View>
              </View>

            </ScrollView>

            <View style={[styles.footer, Styles.Shadow]}>
              <WrapButton 
                enable={recoverEnable}
                text={'Khôi phục'}
                type={'border'}
                active={true}
                width={Constants.Width/2 - 30}
                containerStyle={{marginRight: 20}}
                onPress={this.handleFilterRecover}
              />
              <WrapButton 
                text={'Áp dụng'}
                type={'solid'}
                width={Constants.Width/2 - 30}
                onPress={this.handleFilterSubmit}
              />
            </View>
          </View>
          
        </View>
      </WrapModal>
    )
  }

}