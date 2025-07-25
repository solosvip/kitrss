/**
 * 微内核调度器
 * 负责模块的加载、管理和协调
 */

import { IModule } from '../contracts/module-interface.js'
import { IStorage } from '../contracts/storage-interface.js'
import { IEventBus } from '../contracts/event-interface.js'

export class Kernel {
  constructor() {
    this.modules = new Map()
    this.services = new Map()
    this.isInitialized = false
    this.isRunning = false
    this.config = {}
  }

  /**
   * 初始化内核
   * @param {Object} config 全局配置
   */
  async init(config = {}) {
    if (this.isInitialized) {
      throw new Error('Kernel already initialized')
    }

    this.config = { ...this.getDefaultConfig(), ...config }
    this.isInitialized = true

    // 注册核心服务
    await this.registerCoreServices()
    
    // 发布系统初始化事件
    if (this.services.has('eventBus')) {
      await this.services.get('eventBus').publish('system:init')
    }

    console.log('Kernel initialized')
  }

  /**
   * 启动内核
   */
  async start() {
    if (!this.isInitialized) {
      throw new Error('Kernel not initialized')
    }

    if (this.isRunning) {
      throw new Error('Kernel already running')
    }

    this.isRunning = true

    // 按依赖顺序启动模块
    const sortedModules = this.getSortedModules()
    
    for (const moduleName of sortedModules) {
      try {
        await this.activateModule(moduleName)
      } catch (error) {
        console.error(`Failed to activate module ${moduleName}:`, error)
        throw error
      }
    }

    // 发布系统就绪事件
    if (this.services.has('eventBus')) {
      await this.services.get('eventBus').publish('system:ready')
    }

    console.log('Kernel started')
  }

  /**
   * 停止内核
   */
  async stop() {
    if (!this.isRunning) {
      return
    }

    this.isRunning = false

    // 按依赖逆序停止模块
    const sortedModules = this.getSortedModules().reverse()
    
    for (const moduleName of sortedModules) {
      try {
        await this.deactivateModule(moduleName)
      } catch (error) {
        console.error(`Failed to deactivate module ${moduleName}:`, error)
      }
    }

    // 发布系统关闭事件
    if (this.services.has('eventBus')) {
      await this.services.get('eventBus').publish('system:shutdown')
    }

    console.log('Kernel stopped')
  }

  /**
   * 注册服务
   * @param {string} name 服务名称
   * @param {*} service 服务实例
   */
  registerService(name, service) {
    this.services.set(name, service)
    console.log(`Service registered: ${name}`)
  }

  /**
   * 获取服务
   * @param {string} name 服务名称
   * @returns {*} 服务实例
   */
  getService(name) {
    if (!this.services.has(name)) {
      throw new Error(`Service not found: ${name}`)
    }
    return this.services.get(name)
  }

  /**
   * 加载模块
   * @param {string} moduleName 模块名称
   * @param {IModule} moduleInstance 模块实例
   */
  async loadModule(moduleName, moduleInstance) {
    if (!(moduleInstance instanceof IModule)) {
      throw new Error('Module must implement IModule interface')
    }

    if (this.modules.has(moduleName)) {
      throw new Error(`Module already loaded: ${moduleName}`)
    }

    this.modules.set(moduleName, {
      instance: moduleInstance,
      isActive: false,
      config: {}
    })

    try {
      await moduleInstance.init(this.getModuleConfig(moduleName))
      console.log(`Module loaded: ${moduleName}`)
    } catch (error) {
      this.modules.delete(moduleName)
      throw error
    }
  }

  /**
   * 卸载模块
   * @param {string} moduleName 模块名称
   */
  async unloadModule(moduleName) {
    if (!this.modules.has(moduleName)) {
      throw new Error(`Module not found: ${moduleName}`)
    }

    const module = this.modules.get(moduleName)
    
    if (module.isActive) {
      await this.deactivateModule(moduleName)
    }

    await module.instance.destroy()
    this.modules.delete(moduleName)
    console.log(`Module unloaded: ${moduleName}`)
  }

  /**
   * 激活模块
   * @param {string} moduleName 模块名称
   */
  async activateModule(moduleName) {
    const module = this.modules.get(moduleName)
    if (!module) {
      throw new Error(`Module not found: ${moduleName}`)
    }

    if (module.isActive) {
      return
    }

    await module.instance.activate()
    module.isActive = true
    console.log(`Module activated: ${moduleName}`)
  }

  /**
   * 停用模块
   * @param {string} moduleName 模块名称
   */
  async deactivateModule(moduleName) {
    const module = this.modules.get(moduleName)
    if (!module) {
      throw new Error(`Module not found: ${moduleName}`)
    }

    if (!module.isActive) {
      return
    }

    await module.instance.deactivate()
    module.isActive = false
    console.log(`Module deactivated: ${moduleName}`)
  }

  /**
   * 获取模块列表
   * @returns {string[]} 模块名称列表
   */
  getModuleList() {
    return Array.from(this.modules.keys())
  }

  /**
   * 检查模块是否激活
   * @param {string} moduleName 模块名称
   * @returns {boolean} 是否激活
   */
  isModuleActive(moduleName) {
    const module = this.modules.get(moduleName)
    return module ? module.isActive : false
  }

  /**
   * 注册核心服务
   */
  async registerCoreServices() {
    // 事件总线将在单独的模块中实现
    // 存储服务将在单独的模块中实现
    console.log('Core services registered')
  }

  /**
   * 获取排序后的模块列表（考虑依赖关系）
   * @returns {string[]} 排序后的模块名称列表
   */
  getSortedModules() {
    const modules = Array.from(this.modules.keys())
    const visited = new Set()
    const result = []

    const visit = (moduleName) => {
      if (visited.has(moduleName)) return
      visited.add(moduleName)

      const module = this.modules.get(moduleName)
      if (module) {
        const dependencies = module.instance.getDependencies() || []
        for (const dep of dependencies) {
          if (this.modules.has(dep)) {
            visit(dep)
          }
        }
      }

      result.push(moduleName)
    }

    for (const moduleName of modules) {
      visit(moduleName)
    }

    return result
  }

  /**
   * 获取模块配置
   * @param {string} moduleName 模块名称
   * @returns {Object} 模块配置
   */
  getModuleConfig(moduleName) {
    return this.config.modules?.[moduleName] || {}
  }

  /**
   * 获取默认配置
   * @returns {Object} 默认配置
   */
  getDefaultConfig() {
    return {
      modules: {},
      services: {
        storage: {
          type: 'sqlite',
          path: './data/rss-reader.db'
        }
      }
    }
  }
}

// 全局内核实例
export const kernel = new Kernel()