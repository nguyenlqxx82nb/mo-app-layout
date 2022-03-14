
import { Keyboard, DeviceEventEmitter, Linking } from 'react-native';
import { EmitKeys, Color } from 'mo-app-common';
import moment from 'moment';

enum CallType {
  OUT,
  IN,
  MISS_OUT,
  MISS_IN,
  REJECT_OUT
}

interface IIconType {
  name: string;
  size: number;
  color: string;
}

/**
 * call throught callcentral
 * @param {string} phoneNumber 
 */
const callCenter = (phoneNumber: string) => {
  Keyboard.dismiss();
  phoneNumber = phoneNumber.replace('+84', '0');
  DeviceEventEmitter.emit(EmitKeys.CALL_CENTER_MAKE_CALL, phoneNumber, undefined, true);
}

/**
 * call throught phone
 * @param {string} phoneNumber 
 */
const callMobile = (phoneNumber: string) => {
  Keyboard.dismiss();
  phoneNumber = phoneNumber.replace('+84', '0');
  Linking.openURL(`tel:${phoneNumber}`);
}

/**
 * get callType
 * @param {any} item 
 * @returns 
 */
const getCallType = (item: any) => {
  let callType;
  if (item.type === 'outbound') {
    if (item.status === 'miss') {
      callType = CallType.MISS_OUT;
    } 
    if (item.status === 'listen') {
      callType = CallType.OUT;
    }
    if (item.status === 'reject') {
      callType = CallType.REJECT_OUT;
    }
  }

  if (item.type === 'inbound' && item.status !== 'listen') {
    callType = CallType.MISS_IN;
  } 
  if (item.type === 'inbound' && item.status === 'listen') { 
    callType = CallType.IN;
  }

  return callType;
}

/**
 * get callType icon
 * @param callType 
 * @returns 
 */
const getCallTypeIcon = (callType: CallType) => {
  const iconType: IIconType = {
    name: '',
    size: 13,
    color: ''
  };
  switch(callType) {
    case CallType.OUT :
      iconType.name = 'outbound_call';
      iconType.color = Color.green;
      break;
    case CallType.MISS_IN :
      iconType.name = 'missed_inbound_call';
      iconType.color = Color.red;
      break;
    case CallType.MISS_OUT :
      iconType.name = 'missed_outbound_call';
      iconType.color = Color.red;
      break;
    case CallType.REJECT_OUT :
      iconType.name = 'missed_outbound_call';
      iconType.color = '#fbb107';
      break;
    default: 
      iconType.name = 'inbound_call';
      iconType.color = Color.primary;
  }
  return iconType;
}

/**
 * get call type name
 * @param callType 
 * @returns 
 */
const getCallTypeName = (callType: CallType) => {
  switch(callType) {
    case CallType.OUT :
      return 'Cuộc gọi đi';
    case CallType.MISS_IN :
      return 'Cuộc gọi đến - nhỡ';
    case CallType.MISS_OUT :
      return 'Cuộc gọi đi - nhỡ';
    case CallType.REJECT_OUT :
      return 'Cuộc gọi đi - từ chối nghe';
    default: 
      return 'Cuộc gọi đến';
  }
}

/**
 * convert create time
 * @param createTime 
 * @returns 
 */
const convertCreateTime = (createTime: string) => {
  const createDate =  moment(createTime).add(7,'hour');
  const diffDate = moment().add(7,'hour').diff(createDate, 'day');
  // console.log('createDate ', createDate, ' diffDate=', diffDate, ' createTime=',createTime, 'moment=', moment().add(7,'hour'), diffDate);
  if (diffDate === 0 && createDate.isSame(moment(), 'day')) {
    return `Hôm nay lúc ${createDate.format('HH:mm')}`;
  }
  if (diffDate <= 1) {
    return `Hôm qua lúc ${createDate.format('HH:mm')}`
  }

  return `${createDate.format('DD/MM/YYYY HH:mm')}`;
}

/**
 * convert time duration
 * @param {number} duration 
 * @returns 
 */
const convertTimeDuration = (duration: number) => {
  let time = '';
  if (duration < 60) {
    time = `0 phút ${duration} giây`;
  }
  if (duration >= 60) {
    time = `${Math.round(duration/60)} phút ${duration%60} giây`;
  }

  return time;
}

const getDefautlCallFilter = () => {
  return {
    callCenterNumber: [],
    callState: [],
    callType: null,
    startDate: moment().subtract(29, 'days'),
    endDate: moment()
  }
}

export {
  callCenter,
  callMobile,
  CallType,
  getCallType,
  getCallTypeIcon,
  getCallTypeName,
  convertCreateTime,
  convertTimeDuration,
  getDefautlCallFilter
}