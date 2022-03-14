
import SocketIO from 'socket.io-client';
import { DeviceEventEmitter } from 'react-native';
import { AppConfig, Constants, JwtHelper, SocialIcon, SocialService, Storage, StorageKeys, toast, Utils } from 'mo-app-common';
import { Router } from 'mo-app-comp';

class SocketManager {

  settingOnline: any;
  socket: any;
  ignoreNotification: boolean;

  constructor() {
    this.settingSocials();
    this.ignoreNotification = false;
  }

  /**
   * disconnect
   */
  getSocket() {
    if (!this.socket) {
      return null;
    }
    return this.socket;
  }
  /**
   * disconnect
   */
  disconnect() {
    if (this.socket) {
      this.socket.emit('disconnect_request');
    }
  }
  /**
   * close
   */
  close() {
    if (this.socket) {
      this.socket.close();
    }
  }
  /**
   * connect
   */
  connect = async () => {
    this.socket = SocketIO(AppConfig.Domain, {
      pingInterval: 25000,
      pingTimeout: 60000,
      // autoConnect: false

    });
    if (!this.socket) {
      return;
    }
    await Utils.initGlobalData();
    this.socket.on('connect', () => {
      if (Constants.StaffId) {
        this.handShake(Constants.StaffId, Constants.MerchantId);
      }
      this.socket.on('disconnecting', (reason: any) => {
        console.log('socket disconnecting', reason);
      });
      this.socket.on('disconnect', (reason: any) => {
        console.log('socket disconnect', reason);
        // this.socket.open();
      });
      console.log('connect socket ok', this.socket.id);
    });

    this.socket.on('mobio_response', (data: any) => {
      // console.log('mobio_response ', data);
      this.handleSocketResponse(data, Constants.StaffId);
    });
    this.socket.on('my_ping', () => {
      console.log('my_ping ');
      if (this.socket) {
        this.socket.emit('my_pong');
      }
    });
  }

  /**
   * hand shake
   * @param accountId
   * @param merchantId
   */
  handShake = (accountId: string, merchantId: string) => {
    this.socket.emit('hand_shake', {
      staff_id: accountId,
      merchant_id: merchantId
    });
  }

  /**
   * handle socket data response
   * @param event
   * @param staffId
   */

  handleSocketResponse = (event: any, staffId: string) => {
    if (!event || !event.data || !event.data.from || !event.data.to || (event.data.from.source !== 'social-crm' && event.data.from.source !== 'chattool')) {
      return;
    }
    const dataHandler = event.data;
    if (event.data.from.source === 'chattool') {
      dataHandler.body.page_social_id = event.data.body.domain_id;
      dataHandler.body.social_type = Constants.SOCIAL.TYPE.WEB_LIVE_CHAT;
    }
    const dataTo = dataHandler.to;
    const receiverIds = dataTo.receiver_ids;
    if ((dataTo.receiver_id === staffId || (receiverIds && receiverIds.length && receiverIds.includes(staffId))) || (event.data.from.source === 'chattool' && dataTo.receiver_id === Constants.MerchantId)) {
      DeviceEventEmitter.emit(Constants.EmitCode.SOCIAL_NOTIFICATION, dataHandler);
      // console.log('socketData', dataHandler);
      if (this.ignoreNotification || event.data.from.source === 'chattool') {
        return;
      }
      const body = dataHandler.body;
      body.specific_notification_id = dataHandler.notify_id;
      body.specific_notification_is_read = 0;
      switch (body.socket_type) {
        case 'ASSIGN_CONVERSATION_SOCKET':
          this.handlerPushNotification(body, 'ASSIGN', 'conversation');
          break;
        case 'ASSIGN_COMMENT_SOCKET':
          this.handlerPushNotification(body, 'ASSIGN', 'comment');
          break;
        // case 'ASSIGN_RATING_SOCKET':
        //   this.handlerPushNotification(body, 'ASSIGN', 'rating');
        //   break;

        case 'NEW_MESSAGE_SOCKET':
        case 'NEW_COMMENT_SOCKET':
          // case 'NEW_RATING_SOCKET':
          this.handlerPushNotification(body, 'NEW', '');
      }
    }
  }

  protected getAvatarPage(page, isErrorImage) {
    SocialService.getInfoSocial('avatar-page', isErrorImage, page).then(link => {
      if (!link) {
        this.getAvatarPage(page, true);
        return;
      }
      page.icon = link;
      page.avatar = link;
    });
  }

  private settingSocials = async () => {
    const allSetting = await Storage.getItem(StorageKeys.KEY_CACHE_SETTING_ALL);
    if (!allSetting || !allSetting.data || !allSetting.data.length) {
      return;
    }
    const data = allSetting.data;
    const settingsAccount = data.find(item => item.key === StorageKeys.KEY_CACHE_SETTING);
    if (!settingsAccount || !settingsAccount.values || !settingsAccount.values.basic) {
      return;
    }
    const settingBasic = settingsAccount.values.basic;
    const settingSocial = settingBasic.find(item => item.key === 'SETTING_ONLINE');
    if (!settingSocial || !settingSocial.content || !settingSocial.content.length) {
      return;
    }
    this.settingOnline = settingSocial;
  }

  private handlerPushNotification = async (body: any, typeSocket: string, fieldGetUserAssign: string) => {

    const staffId = JwtHelper.decodeToken().id;
    const featureType = SocialService.getFeatureTypeBySocialTypeSocket(body.socket_type);
    let userAssingItem;
    if (typeSocket === 'NEW') {
      userAssingItem = SocialService.convertUserAssignFromSocket(body, featureType);
    }

    if (typeSocket === 'ASSIGN' && body && body.data && body.data.assignee_type) {
      const typeAssign = body && body.data && body.data.assignee_type;
      if (typeAssign === 'TEAM') {
        return;
      }
      userAssingItem = body && body.data && body.data[fieldGetUserAssign];
      if (!userAssingItem) {
        return;
      }
      userAssingItem.page_id = body.page_id;
      userAssingItem.social_type = body.social_type;
      userAssingItem.socket_type = body.socket_type;
    }

    // if (!userAssingItem || (Router.getCurrentScreen() && userAssingItem.id === Router.getCurrentScreen().id)) {
    //   return;
    // }

    if (userAssingItem && (userAssingItem.status === 2 || userAssingItem.assignees && userAssingItem.assignees[0] && userAssingItem.assignees[0].assignee_id !== staffId)) {
      return;
    }

    let subTitle: string = 'Bình luận mới';
    const featureCodeOfSocket = SocialService.getFeatureTypeBySocialTypeSocket(body.socket_type);
    if (featureCodeOfSocket === Constants.SOCIAL.FEATURE_CODE.MESSAGE) {
      subTitle = 'Tin nhắn mới';
    }
    let title = 'Facebook';
    switch (body.social_type) {
      case Constants.SOCIAL.TYPE.FACEBOOK:
        break;
      case Constants.SOCIAL.TYPE.INSTAGRAM:
        title = 'Instagram';
        break;
      case Constants.SOCIAL.TYPE.LINE:
        title = 'LINE';
        break;
      case Constants.SOCIAL.TYPE.MOBILE_APP:
        title = 'Mobio';
        break;
      case Constants.SOCIAL.TYPE.WEB_LIVE_CHAT:
        title = 'Weblivechat';
        break;
      case Constants.SOCIAL.TYPE.YOUTUBE:
        title = 'Youtube';
        break;
      case Constants.SOCIAL.TYPE.ZALO:
        title = 'Zalo';
        break;
      default:
        break;
    }
    const page: any = {
      page_social_id: body.page_social_id,
      social_type: body.social_type,
      id: body.page_id || body.id,
    };
    let icon = '';
    if (userAssingItem.last_message && userAssingItem.last_message.from && userAssingItem.last_message.from.id) {
      icon = await SocialService.setAvatarComment(userAssingItem.last_message.from.id, page);
    }
    toast(userAssingItem.last_message && userAssingItem.last_message.message || '', 'notification', title, subTitle, icon, userAssingItem);
  }
}

export default new SocketManager();
