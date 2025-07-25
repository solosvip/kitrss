/**
 * 系统测试脚本
 * 验证核心功能是否正常工作
 */

import { startRSSReader, stopRSSReader } from './main.js'

async function testSystem() {
  console.log('🧪 开始系统测试...\n')
  
  try {
    // 启动系统
    console.log('1. 启动RSS阅读器...')
    const system = await startRSSReader()
    
    // 测试存储API
    console.log('2. 测试存储API...')
    const storage = system.storage
    
    // 测试添加分类
    const category = await storage.addCategory({
      name: '技术',
      color: '#007acc',
      sort_order: 1
    })
    console.log(`   ✅ 分类创建成功: ${category.name} (ID: ${category.id})`)
    
    // 测试添加RSS源
    const feed = await storage.addFeed({
      url: 'https://example.com/rss',
      title: '示例RSS源',
      description: '这是一个测试RSS源',
      category_id: category.id
    })
    console.log(`   ✅ RSS源添加成功: ${feed.title} (ID: ${feed.id})`)
    
    // 测试添加文章
    const article = await storage.addArticle({
      feed_id: feed.id,
      guid: 'test-article-001',
      title: '测试文章标题',
      content: '<p>这是测试文章内容</p>',
      summary: '测试文章摘要',
      link: 'https://example.com/article/1',
      author: '测试作者',
      published_at: Math.floor(Date.now() / 1000),
      image_url: 'https://example.com/image.jpg',
      tags: ['测试', '技术']
    })
    console.log(`   ✅ 文章添加成功: ${article.title} (ID: ${article.id})`)
    
    // 测试获取统计信息
    const stats = await storage.getStatistics()
    console.log(`   📊 系统统计: ${stats.totalFeeds}个源, ${stats.totalArticles}篇文章`)
    
    // 测试搜索功能
    const searchResults = await storage.searchArticles('测试')
    console.log(`   🔍 搜索结果: 找到 ${searchResults.length} 篇文章`)
    
    // 测试用户偏好
    await storage.setUserPreference('theme', 'dark', 'string')
    const theme = await storage.getUserPreference('theme')
    console.log(`   ⚙️  用户偏好: 主题设置为 ${theme}`)
    
    console.log('\n🎉 所有测试通过！系统运行正常。\n')
    
  } catch (error) {
    console.error('❌ 测试失败:', error.message)
    console.error(error.stack)
  } finally {
    // 清理测试数据
    try {
      const storage = (await startRSSReader()).storage
      
      // 删除测试数据
      const articles = await storage.getArticles()
      for (const article of articles) {
        if (article.title === '测试文章标题') {
          await storage.deleteArticle(article.id)
        }
      }
      
      const feeds = await storage.getFeeds()
      for (const feed of feeds) {
        if (feed.title === '示例RSS源') {
          await storage.deleteFeed(feed.id)
        }
      }
      
      const categories = await storage.getCategories()
      for (const category of categories) {
        if (category.name === '技术') {
          await storage.deleteCategory(category.id)
        }
      }
      
      console.log('🧹 测试数据已清理')
    } catch (cleanupError) {
      console.warn('⚠️  清理测试数据时出错:', cleanupError.message)
    }
    
    // 停止系统
    await stopRSSReader()
    console.log('🔌 系统已停止')
  }
}

// 运行测试
if (import.meta.url === `file://${process.argv[1]}`) {
  testSystem()
    .then(() => {
      process.exit(0)
    })
    .catch(error => {
      console.error('测试脚本执行失败:', error)
      process.exit(1)
    })
}

export { testSystem }