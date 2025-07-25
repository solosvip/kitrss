/**
 * 存储接口契约
 * 所有存储实现必须遵循此接口
 */

export class IStorage {
  constructor() {
    if (this.constructor === IStorage) {
      throw new Error('Cannot instantiate interface')
    }
  }

  /**
   * 初始化存储连接
   * @param {Object} config 存储配置
   * @returns {Promise<void>}
   */
  async connect(config = {}) {
    throw new Error('Method not implemented')
  }

  /**
   * 关闭存储连接
   * @returns {Promise<void>}
   */
  async disconnect() {
    throw new Error('Method not implemented')
  }

  // RSS源管理
  async addFeed(feedData) { throw new Error('Method not implemented') }
  async removeFeed(feedId) { throw new Error('Method not implemented') }
  async updateFeed(feedId, updates) { throw new Error('Method not implemented') }
  async getFeed(feedId) { throw new Error('Method not implemented') }
  async getFeeds(filter = {}) { throw new Error('Method not implemented') }
  async getFeedCount() { throw new Error('Method not implemented') }

  // 文章管理
  async addArticle(articleData) { throw new Error('Method not implemented') }
  async getArticle(articleId) { throw new Error('Method not implemented') }
  async getArticles(filter = {}, pagination = {}) { throw new Error('Method not implemented') }
  async markArticleAsRead(articleId) { throw new Error('Method not implemented') }
  async markArticleAsUnread(articleId) { throw new Error('Method not implemented') }
  async markAllArticlesAsRead(feedId = null) { throw new Error('Method not implemented') }
  async deleteArticle(articleId) { throw new Error('Method not implemented') }
  async getArticleCount(filter = {}) { throw new Error('Method not implemented') }

  // 用户偏好
  async setPreference(key, value) { throw new Error('Method not implemented') }
  async getPreference(key, defaultValue = null) { throw new Error('Method not implemented') }
  async getAllPreferences() { throw new Error('Method not implemented') }
  async deletePreference(key) { throw new Error('Method not implemented') }

  // 书签管理
  async addBookmark(articleId) { throw new Error('Method not implemented') }
  async removeBookmark(articleId) { throw new Error('Method not implemented') }
  async getBookmarks(filter = {}, pagination = {}) { throw new Error('Method not implemented') }
  async isBookmarked(articleId) { throw new Error('Method not implemented') }

  // 搜索和过滤
  async searchArticles(query, filters = {}) { throw new Error('Method not implemented') }
  async searchFeeds(query) { throw new Error('Method not implemented') }

  // 数据维护
  async cleanupOldArticles(maxAgeDays) { throw new Error('Method not implemented') }
  async vacuum() { throw new Error('Method not implemented') }
  async backup() { throw new Error('Method not implemented') }
  async restore(backupData) { throw new Error('Method not implemented') }

  // 事务支持
  async beginTransaction() { throw new Error('Method not implemented') }
  async commitTransaction() { throw new Error('Method not implemented') }
  async rollbackTransaction() { throw new Error('Method not implemented') }
}