export const BASE = {
  PLATFORM_TYPE: 5,
  DEVICE_NAME: 'webim',
  NETWORK_TYPE: 'WIFI',
  VERSION: 'vvvv1.1'
}

export const SERVICE_TYPE = {
  ACCESS: 'access',
  DISP: 'disp',
  SYNC: 'sync'
}

export const RESOURCE_TYPE = {
  RESOURCE_TYPE_USER_POINT: 1,
  RESOURCE_TYPE_USER: 2,
  RESOURCE_TYPE_CONVERSATION: 4
}

export const SEND_STATUS = {
  FAILURE: 0,
  SUCCESS: 1,
  PENDING: 2
}

export const METHOD_ID = {
  LOGIN: 12288,
  LOGOUT: 16386,
  INBOX_MSG_ARRIVED_BATCH: -20487,
  INBOX_MSG_ARRIVED: -20486,
  CONV_MSG_READ: -28720,
  SEND_CONV_MSG: 28720,
  KICKED_OFFLINE: -16386,
  ACK_INBOX_MSG: 20501,
  MARK_CONV_MSG_READ: 28721,
  GET_CONV_MSG: 28724
}

export const CONVTYPE = {
  P2P: 0, // 双方会话
  GRP: 1, // 群组
  CNF: 2  // 会议
}

export const SAVED_MESSAGE_COUNT_PER_CONV = 5

export const PULL_MESSAGE_REQUEST_ID = 'PULL_MESSAGE_REQUEST_ID'

export const MSG_TRUNCATE_LENGTH = 512
export const MAX_MESSAGE_LENGTH = MSG_TRUNCATE_LENGTH * 3

export const MSG_DIR = {
  UP: 'up', // 上行消息
  DOWN: 'down' // 下行消息
}

export const AT_NOTICE_STATUS = {
  'NONE': 0,
  'READ': 1,
  'UNREAD': 2
}

export const MAX_SIGNED_INT_32 = Math.pow(2, 32) - 1

export const SEND_MODE = {
  ENTER_ONLY: 0,
  CTRL_AND_ENTER: 1
}
