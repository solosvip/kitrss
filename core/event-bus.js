/**
 * 事件总线实现
 * 基于发布-订阅模式的事件系统
 */

import { IEventBus, StandardEvents } from '../contracts/event-interface.js'

export class EventBus extends IEventBus {
  constructor() {
    super()
    this.listeners = new Map()
    this.onceListeners = new Map()
    this.subscriptionId = 0
  }

  /**
   * 发布事件
   * @param {string} eventName 事件名称
   * @param {*} data 事件数据
   * @param {Object} options 选项
   */
  async publish(eventName, data = null, options = {}) {
    if (!eventName) {
      throw new Error('Event name is required')
    }

    const eventData = {
      name: eventName,
      data,
      timestamp: Date.now(),
      ...options
    }

    // 触发普通监听器
    const listeners = this.listeners.get(eventName) || []
    const promises = listeners.map(listener => this.executeListener(listener, eventData))

    // 触发一次性监听器
    const onceListeners = this.onceListeners.get(eventName) || []
    this.onceListeners.delete(eventName)
    const oncePromises = onceListeners.map(listener => this.executeListener(listener, eventData))

    await Promise.all([...promises, ...oncePromises])
  }

  /**
   * 订阅事件
   * @param {string} eventName 事件名称
   * @param {Function} callback 回调函数
   * @param {Object} options 选项
   * @returns {string} 订阅ID
   */
  subscribe(eventName, callback, options = {}) {
    if (!eventName) {
      throw new Error('Event name is required')
    }
    if (typeof callback !== 'function') {
      throw new Error('Callback must be a function')
    }

    const subscriptionId = `sub_${++this.subscriptionId}`
    
    if (!this.listeners.has(eventName)) {
      this.listeners.set(eventName, [])
    }

    this.listeners.get(eventName).push({
      id: subscriptionId,
      callback,
      options,
      once: false
    })

    return subscriptionId
  }

  /**
   * 取消订阅
   * @param {string} subscriptionId 订阅ID
   */
  unsubscribe(subscriptionId) {
    if (!subscriptionId) return

    // 从普通监听器中移除
    for (const [eventName, listeners] of this.listeners) {
      const index = listeners.findIndex(l => l.id === subscriptionId)
      if (index !== -1) {
        listeners.splice(index, 1)
        if (listeners.length === 0) {
          this.listeners.delete(eventName)
        }
        return
      }
    }

    // 从一次性监听器中移除
    for (const [eventName, listeners] of this.onceListeners) {
      const index = listeners.findIndex(l => l.id === subscriptionId)
      if (index !== -1) {
        listeners.splice(index, 1)
        if (listeners.length === 0) {
          this.onceListeners.delete(eventName)
        }
        return
      }
    }
  }

  /**
   * 订阅一次性事件
   * @param {string} eventName 事件名称
   * @param {Function} callback 回调函数
   */
  once(eventName, callback) {
    if (!eventName) {
      throw new Error('Event name is required')
    }
    if (typeof callback !== 'function') {
      throw new Error('Callback must be a function')
    }

    const subscriptionId = `once_${++this.subscriptionId}`
    
    if (!this.onceListeners.has(eventName)) {
      this.onceListeners.set(eventName, [])
    }

    this.onceListeners.get(eventName).push({
      id: subscriptionId,
      callback,
      options: {},
      once: true
    })

    return subscriptionId
  }

  /**
   * 等待事件
   * @param {string} eventName 事件名称
   * @param {number} timeout 超时时间(ms)
   * @returns {Promise<*>} 事件数据
   */
  waitFor(eventName, timeout = 5000) {
    return new Promise((resolve, reject) => {
      let timeoutId
      
      const subscriptionId = this.once(eventName, (data) => {
        clearTimeout(timeoutId)
        resolve(data)
      })

      timeoutId = setTimeout(() => {
        this.unsubscribe(subscriptionId)
        reject(new Error(`Event '${eventName}' timeout after ${timeout}ms`))
      }, timeout)
    })
  }

  /**
   * 获取事件监听器数量
   * @param {string} eventName 事件名称
   * @returns {number} 监听器数量
   */
  getListenerCount(eventName) {
    if (!eventName) {
      const total = Array.from(this.listeners.values()).reduce((sum, listeners) => sum + listeners.length, 0)
      const onceTotal = Array.from(this.onceListeners.values()).reduce((sum, listeners) => sum + listeners.length, 0)
      return total + onceTotal
    }

    const listeners = this.listeners.get(eventName) || []
    const onceListeners = this.onceListeners.get(eventName) || []
    return listeners.length + onceListeners.length
  }

  /**
   * 清除所有监听器
   * @param {string} eventName 事件名称(可选)
   */
  clear(eventName = null) {
    if (eventName) {
      this.listeners.delete(eventName)
      this.onceListeners.delete(eventName)
    } else {
      this.listeners.clear()
      this.onceListeners.clear()
    }
  }

  /**
   * 获取所有事件名称
   * @returns {string[]} 事件名称列表
   */
  getEventNames() {
    const events = new Set()
    
    for (const eventName of this.listeners.keys()) {
      events.add(eventName)
    }
    
    for (const eventName of this.onceListeners.keys()) {
      events.add(eventName)
    }

    return Array.from(events)
  }

  /**
   * 执行监听器
   * @param {Object} listener 监听器对象
   * @param {Object} eventData 事件数据
   */
  async executeListener(listener, eventData) {
    try {
      const result = await listener.callback(eventData)
      
      // 如果回调返回 false，则取消订阅
      if (result === false) {
        this.unsubscribe(listener.id)
      }
    } catch (error) {
      console.error(`Error in event listener for '${eventData.name}':`, error)
      
      // 发布错误事件
      await this.publish('error:listener', {
        eventName: eventData.name,
        error: error.message,
        listenerId: listener.id
      })
    }
  }

  /**
   * 调试信息
   * @returns {Object} 调试信息
   */
  getDebugInfo() {
    const info = {
      totalListeners: this.getListenerCount(),
      eventNames: this.getEventNames(),
      events: {}
    }

    for (const eventName of this.getEventNames()) {
      info.events[eventName] = {
        listeners: this.getListenerCount(eventName),
        hasRegular: this.listeners.has(eventName),
        hasOnce: this.onceListeners.has(eventName)
      }
    }

    return info
  }
}

// 全局事件总线实例
export const eventBus = new EventBus()

// 快捷方法
export const { publish, subscribe, unsubscribe, once, waitFor } = eventBus