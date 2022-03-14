import React from 'react';
import { View, EmitterSubscription, DeviceEventEmitter } from 'react-native';
import { WrapText, Dropdown } from 'mo-app-comp';
import { Color, CustomIcon, Styles, StringeeKeys, Constants, EmitKeys, StringeeService } from 'mo-app-common';

interface IUserStatusSelectState {
  selectedStatus: string;
}
export default class UserStatusSelect extends React.PureComponent<any, IUserStatusSelectState> {
  statusChangeSubscription : EmitterSubscription;
  constructor(props: any) {
    super(props);
    this.state = {
      selectedStatus: Constants.CALL_STATUS
    };
    this.statusChangeSubscription = DeviceEventEmitter.addListener(EmitKeys.CALL_CENTER_STATUS_CHANGE, this.onStatusChangeHandler);
  }

  componentDidMount() {

  }

  onStatusChangeHandler = (status: string) => {
    this.setState({selectedStatus: status});
  }

  onItemSelectedChangeHandler = async (item: any) => {
    const { selectedStatus } = this.state;
    const result = await StringeeService.updateAgent(item.id);
    if (result) {
      Constants.CALL_STATUS = item.id;
    }
    DeviceEventEmitter.emit(EmitKeys.CALL_CENTER_STATUS_CHANGE, result ? item.id : selectedStatus);
  }

  renderBaseStatusDropdown = (item: any) => {
    const color = item.id === StringeeKeys.STATUS_AVAILABLE ? Color.green : Color.red;
    return (
      <View style={[Styles.RowCenter, { height: 25 }]}>
        <CustomIcon name={'call_status'} size={10} color={color} />
        <WrapText st={[Styles.Text_S_M, { marginLeft: 5, marginRight: 5 }]} c={color}>{item.label}</WrapText>
        <CustomIcon name={'drop_down'} size={10} color={Color.text} />
      </View>
    );
  }

  renderItemStatusDropdown = (item: any, selectedKey: any) => {
    const color = item.id === StringeeKeys.STATUS_AVAILABLE ? Color.green : Color.red;
    return (
      <View style={[Styles.RowCenter, Styles.JustifyBetween, { paddingVertical: 5 }]}>
        <View style={[Styles.RowCenter]}>
          <CustomIcon name={'call_status'} size={10} color={color} />
          <WrapText st={[Styles.Text_S_M, { marginLeft: 5, marginRight: 10 }]} c={color}>{item.label}</WrapText>
        </View>
        { selectedKey === item.id && <CustomIcon name={'mark_selected'} size={10} color={Color.text} />}
      </View>
    );
  }

  render() {
    const { selectedStatus } = this.state;
    return (
      <Dropdown
        align={'right'}
        width={225}
        height={32}
        renderBase={this.renderBaseStatusDropdown}
        renderItem={this.renderItemStatusDropdown}
        selectedKey={selectedStatus}
        onItemSelected={this.onItemSelectedChangeHandler}
        dropdownOffset={{ top: 30, left: 0 }}
        data={[
          {
            id: StringeeKeys.STATUS_AVAILABLE,
            label: 'Sẵn sàng nhận cuộc gọi'
          },
          {
            id: StringeeKeys.STATUS_NOT_AVAILABLE,
            label: 'Đang bận'
          },
        ]}
      />
    );
  }
}