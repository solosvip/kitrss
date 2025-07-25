/**
 * 事件系统接口契约
 * 实现模块间的解耦通信
 */

export class IEventBus {
  constructor() {
    if (this.constructor === IEventBus) {
      throw new Error('Cannot instantiate interface')
    }
  }

  /**
   * 发布事件
   * @param {string} eventName 事件名称
   * @param {*} data 事件数据
   * @param {Object} options 选项
   */
  publish(eventName, data = null, options = {}) {
    throw new Error('Method not implemented')
  }

  /**
   * 订阅事件
   * @param {string} eventName 事件名称
   * @param {Function} callback 回调函数
   * @param {Object} options 选项
   * @returns {string} 订阅ID
   */
  subscribe(eventName, callback, options = {}) {
    throw new Error('Method not implemented')
  }

  /**
   * 取消订阅
   * @param {string} subscriptionId 订阅ID
   */
  unsubscribe(subscriptionId) {
    throw new Error('Method not implemented')
  }

  /**
   * 订阅一次性事件
   * @param {string} eventName 事件名称
   * @param {Function} callback 回调函数
   */
  once(eventName, callback) {
    throw new Error('Method not implemented')
  }

  /**
   * 等待事件
   * @param {string} eventName 事件名称
   * @param {number} timeout 超时时间(ms)
   * @returns {Promise<*>} 事件数据
   */
  waitFor(eventName, timeout = 5000) {
    throw new Error('Method not implemented')
  }

  /**
   * 获取事件监听器数量
   * @param {string} eventName 事件名称
   * @returns {number} 监听器数量
   */
  getListenerCount(eventName) {
    throw new Error('Method not implemented')
  }

  /**
   * 清除所有监听器
   * @param {string} eventName 事件名称(可选)
   */
  clear(eventName = null) {
    throw new Error('Method not implemented')
  }

  /**
   * 获取所有事件名称
   * @returns {string[]} 事件名称列表
   */
  getEventNames() {
    throw new Error('Method not implemented')
  }
}

// 标准事件定义
export const StandardEvents = {
  // 系统事件
  SYSTEM_INIT: 'system:init',
  SYSTEM_READY: 'system:ready',
  SYSTEM_SHUTDOWN: 'system:shutdown',
  
  // 存储事件
  STORAGE_CONNECTED: 'storage:connected',
  STORAGE_DISCONNECTED: 'storage:disconnected',
  STORAGE_DATA_CHANGED: 'storage:data_changed',
  
  // RSS源事件
  FEED_ADDED: 'feed:added',
  FEED_REMOVED: 'feed:removed',
  FEED_UPDATED: 'feed:updated',
  FEEDS_REFRESHED: 'feeds:refreshed',
  
  // 文章事件
  ARTICLE_ADDED: 'article:added',
  ARTICLE_UPDATED: 'article:updated',
  ARTICLE_DELETED: 'article:deleted',
  ARTICLE_READ: 'article:read',
  ARTICLE_UNREAD: 'article:unread',
  ARTICLE_SELECTED: 'article:selected',
  
  // UI事件
  UI_LAYOUT_CHANGED: 'ui:layout_changed',
  UI_THEME_CHANGED: 'ui:theme_changed',
  UI_SIDEBAR_TOGGLED: 'ui:sidebar_toggled',
  UI_MODAL_OPENED: 'ui:modal_opened',
  UI_MODAL_CLOSED: 'ui:modal_closed',
  
  // 搜索事件
  SEARCH_PERFORMED: 'search:performed',
  SEARCH_CLEARED: 'search:cleared',
  
  // 书签事件
  BOOKMARK_ADDED: 'bookmark:added',
  BOOKMARK_REMOVED: 'bookmark:removed',
  
  // 插件事件
  PLUGIN_LOADED: 'plugin:loaded',
  PLUGIN_UNLOADED: 'plugin:unloaded',
  PLUGIN_ERROR: 'plugin:error'
}