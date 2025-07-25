/**
 * 模块接口契约
 * 所有功能模块必须实现此接口
 */

export class IModule {
  constructor() {
    if (this.constructor === IModule) {
      throw new Error('Cannot instantiate interface')
    }
  }

  /**
   * 模块名称
   * @returns {string} 模块唯一标识
   */
  getName() {
    throw new Error('Method not implemented')
  }

  /**
   * 模块版本
   * @returns {string} 版本号
   */
  getVersion() {
    throw new Error('Method not implemented')
  }

  /**
   * 模块依赖
   * @returns {string[]} 依赖的模块名称列表
   */
  getDependencies() {
    return []
  }

  /**
   * 初始化模块
   * @param {Object} config 配置对象
   * @returns {Promise<void>}
   */
  async init(config = {}) {
    throw new Error('Method not implemented')
  }

  /**
   * 激活模块
   * @returns {Promise<void>}
   */
  async activate() {
    throw new Error('Method not implemented')
  }

  /**
   * 停用模块
   * @returns {Promise<void>}
   */
  async deactivate() {
    throw new Error('Method not implemented')
  }

  /**
   * 销毁模块
   * @returns {Promise<void>}
   */
  async destroy() {
    throw new Error('Method not implemented')
  }

  /**
   * 获取模块配置
   * @returns {Object} 配置对象
   */
  getConfig() {
    return {}
  }

  /**
   * 更新模块配置
   * @param {Object} config 新配置
   */
  updateConfig(config = {}) {
    throw new Error('Method not implemented')
  }
}