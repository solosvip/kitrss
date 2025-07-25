/**
 * RSS阅读器主入口文件
 * 负责初始化整个系统
 */

import { kernel } from './core/kernel.js'
import { eventBus } from './core/event-bus.js'
import { StorageAPI } from './apis/storage-apis.js'
import { RSSParser } from './modules/data/rss-parser/rss-parser.js'

// 全局配置
const CONFIG = {
  storage: {
    type: 'sqlite',
    options: {
      filename: './data/rss-reader.db',
      verbose: false
    }
  },
  rss: {
    timeout: 30000,
    concurrency: 5
  },
  ui: {
    theme: 'light',
    sidebarWidth: 280,
    articleListWidth: 400,
    fontSize: 'medium'
  }
}

/**
 * 初始化存储API
 */
async function initStorageAPI() {
  const storageAPI = new StorageAPI()
  await storageAPI.init(CONFIG.storage)
  
  // 注册到内核服务
  kernel.registerService('storage', storageAPI)
  
  console.log('Storage API initialized')
  return storageAPI
}

/**
 * 初始化RSS解析器
 */
async function initRSSParser() {
  const rssParser = new RSSParser(CONFIG.rss)
  
  // 注册到内核服务
  kernel.registerService('rssParser', rssParser)
  
  console.log('RSS Parser initialized')
  return rssParser
}

/**
 * 初始化事件总线
 */
async function initEventBus() {
  // 注册到内核服务
  kernel.registerService('eventBus', eventBus)
  
  console.log('Event Bus initialized')
  return eventBus
}

/**
 * 初始化核心服务
 */
async function initCoreServices() {
  await initEventBus()
  await initStorageAPI()
  await initRSSParser()
  
  console.log('All core services initialized')
}

/**
 * 启动RSS阅读器
 */
async function startRSSReader() {
  try {
    console.log('Starting RSS Reader...')
    
    // 初始化内核
    await kernel.init(CONFIG)
    
    // 初始化核心服务
    await initCoreServices()
    
    // 启动内核
    await kernel.start()
    
    console.log('RSS Reader started successfully!')
    
    // 返回系统实例
    return {
      kernel,
      eventBus,
      storage: kernel.getService('storage'),
      rssParser: kernel.getService('rssParser')
    }
    
  } catch (error) {
    console.error('Failed to start RSS Reader:', error)
    throw error
  }
}

/**
 * 停止RSS阅读器
 */
async function stopRSSReader() {
  try {
    console.log('Stopping RSS Reader...')
    
    // 停止内核
    await kernel.stop()
    
    console.log('RSS Reader stopped successfully!')
    
  } catch (error) {
    console.error('Failed to stop RSS Reader:', error)
    throw error
  }
}

/**
 * 获取系统状态
 */
function getSystemStatus() {
  return {
    kernel: {
      initialized: kernel.isInitialized,
      running: kernel.isRunning,
      modules: kernel.getModuleList()
    },
    services: {
      storage: kernel.services.has('storage'),
      eventBus: kernel.services.has('eventBus'),
      rssParser: kernel.services.has('rssParser')
    }
  }
}

/**
 * 导出系统API
 */
export {
  startRSSReader,
  stopRSSReader,
  getSystemStatus,
  kernel,
  eventBus,
  CONFIG
}

// 如果是直接运行
if (import.meta.url === `file://${process.argv[1]}`) {
  startRSSReader()
    .then(() => {
      console.log('RSS Reader is running. Press Ctrl+C to stop.')
    })
    .catch(error => {
      console.error('Failed to start:', error)
      process.exit(1)
    })

  // 优雅关闭
  process.on('SIGINT', async () => {
    console.log('\nReceived SIGINT, shutting down gracefully...')
    await stopRSSReader()
    process.exit(0)
  })

  process.on('SIGTERM', async () => {
    console.log('\nReceived SIGTERM, shutting down gracefully...')
    await stopRSSReader()
    process.exit(0)
  })
}