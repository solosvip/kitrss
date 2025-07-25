/**
 * 存储API模块
 * 为其他模块提供统一的数据访问接口
 */

import { SQLiteStorage } from '../modules/data/storage/sqlite-storage.js'
import { eventBus } from '../core/event-bus.js'

export class StorageAPI {
  constructor() {
    this.storage = null
    this.isInitialized = false
  }

  /**
   * 初始化存储API
   * @param {Object} config 存储配置
   */
  async init(config = {}) {
    if (this.isInitialized) {
      return
    }

    // 根据配置创建存储实例
    switch (config.type) {
      case 'sqlite':
        this.storage = new SQLiteStorage(config.options || {})
        break
      default:
        throw new Error(`Unsupported storage type: ${config.type}`)
    }

    await this.storage.connect()
    this.isInitialized = true
    
    console.log('Storage API initialized')
  }

  /**
   * 关闭存储API
   */
  async close() {
    if (!this.isInitialized) {
      return
    }

    await this.storage.disconnect()
    this.storage = null
    this.isInitialized = false
    
    console.log('Storage API closed')
  }

  // RSS源管理API
  async addFeed(feedData) {
    this.ensureInitialized()
    return this.storage.addFeed(feedData)
  }

  async getFeed(id) {
    this.ensureInitialized()
    return this.storage.getFeed(id)
  }

  async getFeeds(options = {}) {
    this.ensureInitialized()
    return this.storage.getFeeds(options)
  }

  async updateFeed(id, updates) {
    this.ensureInitialized()
    return this.storage.updateFeed(id, updates)
  }

  async deleteFeed(id) {
    this.ensureInitialized()
    return this.storage.deleteFeed(id)
  }

  // 文章管理API
  async addArticle(articleData) {
    this.ensureInitialized()
    return this.storage.addArticle(articleData)
  }

  async getArticle(id) {
    this.ensureInitialized()
    return this.storage.getArticle(id)
  }

  async getArticles(options = {}) {
    this.ensureInitialized()
    return this.storage.getArticles(options)
  }

  async updateArticle(id, updates) {
    this.ensureInitialized()
    return this.storage.updateArticle(id, updates)
  }

  async markArticleRead(id) {
    this.ensureInitialized()
    return this.storage.markArticleRead(id)
  }

  async markArticleUnread(id) {
    this.ensureInitialized()
    return this.storage.markArticleUnread(id)
  }

  async starArticle(id) {
    this.ensureInitialized()
    return this.storage.starArticle(id)
  }

  async unstarArticle(id) {
    this.ensureInitialized()
    return this.storage.unstarArticle(id)
  }

  async deleteArticle(id) {
    this.ensureInitialized()
    return this.storage.deleteArticle(id)
  }

  // 分类管理API
  async addCategory(categoryData) {
    this.ensureInitialized()
    return this.storage.addCategory(categoryData)
  }

  async getCategories() {
    this.ensureInitialized()
    return this.storage.getCategories()
  }

  async getCategory(id) {
    this.ensureInitialized()
    return this.storage.getCategory(id)
  }

  async updateCategory(id, updates) {
    this.ensureInitialized()
    return this.storage.updateCategory(id, updates)
  }

  async deleteCategory(id) {
    this.ensureInitialized()
    return this.storage.deleteCategory(id)
  }

  // 书签管理API
  async addBookmark(bookmarkData) {
    this.ensureInitialized()
    return this.storage.addBookmark(bookmarkData)
  }

  async getBookmarks(options = {}) {
    this.ensureInitialized()
    return this.storage.getBookmarks(options)
  }

  async getBookmark(id) {
    this.ensureInitialized()
    return this.storage.getBookmark(id)
  }

  async updateBookmark(id, updates) {
    this.ensureInitialized()
    return this.storage.updateBookmark(id, updates)
  }

  async deleteBookmark(id) {
    this.ensureInitialized()
    return this.storage.deleteBookmark(id)
  }

  // 书签文件夹管理API
  async addBookmarkFolder(folderData) {
    this.ensureInitialized()
    return this.storage.addBookmarkFolder(folderData)
  }

  async getBookmarkFolders() {
    this.ensureInitialized()
    return this.storage.getBookmarkFolders()
  }

  async getBookmarkFolder(id) {
    this.ensureInitialized()
    return this.storage.getBookmarkFolder(id)
  }

  async updateBookmarkFolder(id, updates) {
    this.ensureInitialized()
    return this.storage.updateBookmarkFolder(id, updates)
  }

  async deleteBookmarkFolder(id) {
    this.ensureInitialized()
    return this.storage.deleteBookmarkFolder(id)
  }

  // 用户偏好管理API
  async setUserPreference(key, value, type = 'string') {
    this.ensureInitialized()
    return this.storage.setUserPreference(key, value, type)
  }

  async getUserPreference(key, defaultValue = null) {
    this.ensureInitialized()
    return this.storage.getUserPreference(key, defaultValue)
  }

  async getUserPreferences() {
    this.ensureInitialized()
    return this.storage.getUserPreferences()
  }

  // 搜索历史管理API
  async addSearchHistory(query, searchType = 'all', resultCount = 0) {
    this.ensureInitialized()
    return this.storage.addSearchHistory(query, searchType, resultCount)
  }

  async getSearchHistory(limit = 10) {
    this.ensureInitialized()
    return this.storage.getSearchHistory(limit)
  }

  async clearSearchHistory() {
    this.ensureInitialized()
    return this.storage.clearSearchHistory()
  }

  // 阅读进度管理API
  async updateReadingProgress(articleId, progress) {
    this.ensureInitialized()
    return this.storage.updateReadingProgress(articleId, progress)
  }

  async getReadingProgress(articleId) {
    this.ensureInitialized()
    return this.storage.getReadingProgress(articleId)
  }

  // 统计信息API
  async getStatistics() {
    this.ensureInitialized()
    return this.storage.getStatistics()
  }

  // 数据清理API
  async cleanupOldArticles(days = 30) {
    this.ensureInitialized()
    const deletedCount = await this.storage.cleanupOldArticles(days)
    
    if (deletedCount > 0) {
      eventBus.publish('storage:data_changed', { type: 'cleanup', deletedCount })
    }
    
    return deletedCount
  }

  // 备份和恢复API
  async exportData() {
    this.ensureInitialized()
    return this.storage.exportData()
  }

  async importData(data) {
    this.ensureInitialized()
    await this.storage.importData(data)
    eventBus.publish('storage:data_changed', { type: 'import' })
  }

  /**
   * 确保存储API已初始化
   */
  ensureInitialized() {
    if (!this.isInitialized) {
      throw new Error('Storage API not initialized')
    }
  }

  /**
   * 批量操作API
   */
  async batchMarkRead(articleIds) {
    this.ensureInitialized()
    
    for (const id of articleIds) {
      await this.storage.markArticleRead(id)
    }
    
    eventBus.publish('articles:batch_marked_read', { count: articleIds.length })
  }

  async batchMarkUnread(articleIds) {
    this.ensureInitialized()
    
    for (const id of articleIds) {
      await this.storage.markArticleUnread(id)
    }
    
    eventBus.publish('articles:batch_marked_unread', { count: articleIds.length })
  }

  async batchStar(articleIds) {
    this.ensureInitialized()
    
    for (const id of articleIds) {
      await this.storage.starArticle(id)
    }
    
    eventBus.publish('articles:batch_starred', { count: articleIds.length })
  }

  async batchUnstar(articleIds) {
    this.ensureInitialized()
    
    for (const id of articleIds) {
      await this.storage.unstarArticle(id)
    }
    
    eventBus.publish('articles:batch_unstarred', { count: articleIds.length })
  }

  /**
   * 高级搜索API
   */
  async searchArticles(query, options = {}) {
    this.ensureInitialized()
    
    const searchOptions = {
      search: query,
      ...options
    }
    
    const results = await this.storage.getArticles(searchOptions)
    
    // 记录搜索历史
    await this.storage.addSearchHistory(query, 'articles', results.length)
    
    eventBus.publish('search:performed', { query, type: 'articles', results: results.length })
    
    return results
  }

  async searchFeeds(query) {
    this.ensureInitialized()
    
    const feeds = await this.storage.getFeeds()
    const results = feeds.filter(feed => 
      feed.title.toLowerCase().includes(query.toLowerCase()) ||
      feed.description.toLowerCase().includes(query.toLowerCase())
    )
    
    // 记录搜索历史
    await this.storage.addSearchHistory(query, 'feeds', results.length)
    
    eventBus.publish('search:performed', { query, type: 'feeds', results: results.length })
    
    return results
  }

  /**
   * 获取数据同步状态
   */
  async getSyncStatus() {
    this.ensureInitialized()
    
    const stats = await this.storage.getStatistics()
    return {
      feeds: stats.totalFeeds,
      articles: stats.totalArticles,
      unread: stats.unreadArticles,
      starred: stats.starredArticles,
      lastSync: await this.storage.getUserPreference('last_sync_time')
    }
  }
}