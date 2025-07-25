import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// 简单的Web服务器，不依赖sqlite3
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

class SimpleRSSServer {
    constructor() {
        this.app = express();
        this.port = process.env.PORT || 3000;
        this.setupRoutes();
    }

    setupRoutes() {
        // 静态文件服务
        this.app.use(express.static(path.join(__dirname, 'modules/ui/layout')));
        this.app.use('/static', express.static(path.join(__dirname, 'modules/ui/layout')));
        
        // API路由 - 使用内存数据
        this.setupMockAPI();
        
        // 主页
        this.app.get('/', (req, res) => {
            res.sendFile(path.join(__dirname, 'modules/ui/layout/index.html'));
        });
        
        // 健康检查
        this.app.get('/health', (req, res) => {
            res.json({ status: 'ok', timestamp: new Date().toISOString() });
        });
    }

    setupMockAPI() {
        // 模拟数据
        const mockFeeds = [
            { id: 1, name: '技术博客', url: 'https://example.com/tech', category: '技术', count: 8 },
            { id: 2, name: '新闻网站', url: 'https://example.com/news', category: '新闻', count: 5 },
            { id: 3, name: '开发者社区', url: 'https://example.com/dev', category: '技术', count: 7 }
        ];

        const mockCategories = [
            { id: 1, name: '技术', count: 15 },
            { id: 2, name: '新闻', count: 8 },
            { id: 3, name: '博客', count: 12 }
        ];

        const mockArticles = [
            {
                id: 1,
                title: '深入理解微内核架构设计',
                content: `
                    <h2>什么是微内核架构？</h2>
                    <p>微内核架构是一种软件设计模式，它将系统的核心功能最小化，其他功能以插件或模块的形式实现。这种架构的优势在于：</p>
                    <ul>
                        <li><strong>高度可扩展性</strong>：新功能可以作为独立模块添加</li>
                        <li><strong>易于维护</strong>：模块间低耦合，修改一个模块不会影响其他模块</li>
                        <li><strong>可定制性</strong>：用户可以根据需要启用或禁用特定功能</li>
                    </ul>
                    <p>在我们的RSS阅读器中，微内核架构使得每个功能都可以独立开发和部署。</p>
                `,
                source: '技术博客',
                date: new Date(Date.now() - 3600000),
                url: 'https://example.com/article1',
                isRead: false,
                isStarred: false,
                snippet: '深入理解微内核架构的设计原则和实现方式...'
            },
            {
                id: 2,
                title: '现代RSS阅读器的设计思路',
                content: `
                    <h2>现代RSS阅读器应该具备什么？</h2>
                    <p>在信息爆炸的时代，如何有效地管理和阅读RSS订阅变得尤为重要。现代RSS阅读器应该具备以下特性：</p>
                    <ol>
                        <li>响应式设计，支持多设备</li>
                        <li>智能分类和标签系统</li>
                        <li>全文搜索功能</li>
                        <li>离线阅读支持</li>
                        <li>个性化推荐</li>
                    </ol>
                    <p>通过采用现代Web技术，我们可以构建出用户体验极佳的RSS阅读器。</p>
                `,
                source: '开发者社区',
                date: new Date(Date.now() - 7200000),
                url: 'https://example.com/article2',
                isRead: false,
                isStarred: true,
                snippet: '探讨现代RSS阅读器应该具备的功能和用户体验...'
            },
            {
                id: 3,
                title: '响应式设计的最佳实践',
                content: `
                    <h2>响应式设计的核心原则</h2>
                    <p>响应式设计不仅仅是媒体查询，它需要考虑用户体验、性能优化和可访问性。以下是一些最佳实践：</p>
                    <h3>1. 移动优先</h3>
                    <p>从移动设备开始设计，然后逐步增强桌面体验。</p>
                    <h3>2. 灵活的网格系统</h3>
                    <p>使用CSS Grid和Flexbox创建灵活的布局。</p>
                    <h3>3. 性能优化</h3>
                    <p>优化图片加载，使用适当的字体大小，确保快速加载。</p>
                `,
                source: '技术博客',
                date: new Date(Date.now() - 86400000),
                url: 'https://example.com/article3',
                isRead: true,
                isStarred: false,
                snippet: '分享响应式设计的最佳实践和常见陷阱...'
            }
        ];

        // GET /api/feeds
        this.app.get('/api/feeds', (req, res) => {
            res.json({ success: true, data: mockFeeds });
        });

        // GET /api/categories
        this.app.get('/api/categories', (req, res) => {
            res.json({ success: true, data: mockCategories });
        });

        // GET /api/articles
        this.app.get('/api/articles', (req, res) => {
            const { unread, starred, feedId } = req.query;
            let articles = [...mockArticles];

            if (unread === 'true') {
                articles = articles.filter(a => !a.isRead);
            }
            if (starred === 'true') {
                articles = articles.filter(a => a.isStarred);
            }
            if (feedId) {
                const feed = mockFeeds.find(f => f.id === parseInt(feedId));
                if (feed) {
                    articles = articles.filter(a => a.source === feed.name);
                }
            }

            res.json({ success: true, data: articles });
        });

        // GET /api/articles/:id
        this.app.get('/api/articles/:id', (req, res) => {
            const article = mockArticles.find(a => a.id === parseInt(req.params.id));
            if (!article) {
                return res.status(404).json({ success: false, error: 'Article not found' });
            }
            res.json({ success: true, data: article });
        });

        // PUT /api/articles/:id/read
        this.app.put('/api/articles/:id/read', (req, res) => {
            const article = mockArticles.find(a => a.id === parseInt(req.params.id));
            if (article) {
                article.isRead = true;
                res.json({ success: true });
            } else {
                res.status(404).json({ success: false, error: 'Article not found' });
            }
        });

        // PUT /api/articles/:id/star
        this.app.put('/api/articles/:id/star', (req, res) => {
            const { starred } = req.body;
            const article = mockArticles.find(a => a.id === parseInt(req.params.id));
            if (article) {
                article.isStarred = starred;
                res.json({ success: true });
            } else {
                res.status(404).json({ success: false, error: 'Article not found' });
            }
        });

        // GET /api/search
        this.app.get('/api/search', (req, res) => {
            const { q } = req.query;
            if (!q) {
                return res.status(400).json({ success: false, error: 'Query is required' });
            }

            const results = mockArticles.filter(a => 
                a.title.toLowerCase().includes(q.toLowerCase()) ||
                a.content.toLowerCase().includes(q.toLowerCase())
            );

            res.json({ success: true, data: results });
        });

        // POST /api/feeds
        this.app.post('/api/feeds', express.json(), (req, res) => {
            const { url, category, name } = req.body;
            if (!url) {
                return res.status(400).json({ success: false, error: 'URL is required' });
            }

            const newFeed = {
                id: mockFeeds.length + 1,
                name: name || '新订阅源',
                url,
                category: category || '未分类',
                count: 0
            };

            mockFeeds.push(newFeed);
            res.json({ success: true, data: { id: newFeed.id } });
        });

        // GET /api/stats
        this.app.get('/api/stats', (req, res) => {
            const stats = {
                totalFeeds: mockFeeds.length,
                totalArticles: mockArticles.length,
                unreadArticles: mockArticles.filter(a => !a.isRead).length,
                starredArticles: mockArticles.filter(a => a.isStarred).length,
                lastUpdate: new Date().toISOString()
            };
            res.json({ success: true, data: stats });
        });
    }

    start() {
        this.app.listen(this.port, () => {
            console.log('🚀 RSS阅读器已启动！');
            console.log(`📱 打开浏览器访问: http://localhost:${this.port}`);
            console.log(`🔧 API测试: http://localhost:${this.port}/health`);
            console.log(`📚 文章列表: http://localhost:${this.port}/api/articles`);
            console.log('');
            console.log('💡 提示：');
            console.log('  - 点击左侧菜单可以筛选文章');
            console.log('  - 支持明暗主题切换');
            console.log('  - 使用搜索框快速查找文章');
            console.log('  - 按ESC键关闭弹窗');
        });
    }
}

// 启动服务器
const server = new SimpleRSSServer();
server.start();