const express = require('express');
const path = require('path');
const cors = require('cors');
const compression = require('compression');
const helmet = require('helmet');
const { Kernel } = require('./core/kernel.js');
const { StorageAPI } = require('./apis/storage-apis.js');

class RSSServer {
    constructor() {
        this.app = express();
        this.port = process.env.PORT || 3000;
        this.kernel = null;
        this.storageAPI = null;
        
        this.setupMiddleware();
        this.setupRoutes();
        this.setupErrorHandling();
    }

    setupMiddleware() {
        // 安全中间件
        this.app.use(helmet({
            contentSecurityPolicy: {
                directives: {
                    defaultSrc: ["'self'"],
                    styleSrc: ["'self'", "'unsafe-inline'", "https://cdnjs.cloudflare.com"],
                    scriptSrc: ["'self'", "'unsafe-inline'"],
                    fontSrc: ["'self'", "https://cdnjs.cloudflare.com"],
                    imgSrc: ["'self'", "data:", "https:"],
                    connectSrc: ["'self'"]
                }
            }
        }));
        
        // 压缩中间件
        this.app.use(compression());
        
        // CORS中间件
        this.app.use(cors({
            origin: process.env.CORS_ORIGIN || '*',
            credentials: true
        }));
        
        // 解析中间件
        this.app.use(express.json({ limit: '10mb' }));
        this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));
        
        // 静态文件服务
        this.app.use('/static', express.static(path.join(__dirname, 'modules/ui/layout')));
        this.app.use('/static', express.static(path.join(__dirname, 'public')));
    }

    setupRoutes() {
        // API路由前缀
        const apiRouter = express.Router();
        
        // RSS源管理
        apiRouter.get('/feeds', this.getFeeds.bind(this));
        apiRouter.post('/feeds', this.addFeed.bind(this));
        apiRouter.put('/feeds/:id', this.updateFeed.bind(this));
        apiRouter.delete('/feeds/:id', this.deleteFeed.bind(this));
        
        // 文章管理
        apiRouter.get('/articles', this.getArticles.bind(this));
        apiRouter.get('/articles/:id', this.getArticle.bind(this));
        apiRouter.put('/articles/:id/read', this.markArticleRead.bind(this));
        apiRouter.put('/articles/:id/star', this.toggleArticleStar.bind(this));
        
        // 分类管理
        apiRouter.get('/categories', this.getCategories.bind(this));
        apiRouter.post('/categories', this.addCategory.bind(this));
        
        // 搜索
        apiRouter.get('/search', this.searchArticles.bind(this));
        
        // 统计信息
        apiRouter.get('/stats', this.getStats.bind(this));
        
        // 挂载API路由
        this.app.use('/api', apiRouter);
        
        // 主页路由
        this.app.get('/', (req, res) => {
            res.sendFile(path.join(__dirname, 'modules/ui/layout/index.html'));
        });
        
        // 健康检查
        this.app.get('/health', (req, res) => {
            res.json({ status: 'ok', timestamp: new Date().toISOString() });
        });
    }

    async initialize() {
        try {
            // 初始化内核
            this.kernel = new Kernel();
            await this.kernel.init();
            
            // 获取存储API
            this.storageAPI = await this.kernel.getService('storage');
            
            console.log('RSS服务器初始化完成');
        } catch (error) {
            console.error('服务器初始化失败:', error);
            throw error;
        }
    }

    // API处理器
    async getFeeds(req, res) {
        try {
            const feeds = await this.storageAPI.getAllFeeds();
            res.json({ success: true, data: feeds });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    }

    async addFeed(req, res) {
        try {
            const { url, category, name } = req.body;
            
            if (!url) {
                return res.status(400).json({ success: false, error: 'RSS URL is required' });
            }
            
            const feedId = await this.storageAPI.addFeed(url, category, name);
            res.json({ success: true, data: { id: feedId } });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    }

    async updateFeed(req, res) {
        try {
            const { id } = req.params;
            const updates = req.body;
            
            await this.storageAPI.updateFeed(parseInt(id), updates);
            res.json({ success: true });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    }

    async deleteFeed(req, res) {
        try {
            const { id } = req.params;
            await this.storageAPI.removeFeed(parseInt(id));
            res.json({ success: true });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    }

    async getArticles(req, res) {
        try {
            const { feedId, category, unread, starred, limit = 50, offset = 0 } = req.query;
            
            let articles;
            
            if (feedId) {
                articles = await this.storageAPI.getArticlesByFeed(parseInt(feedId));
            } else if (category) {
                articles = await this.storageAPI.getArticlesByCategory(category);
            } else if (unread === 'true') {
                articles = await this.storageAPI.getUnreadArticles();
            } else if (starred === 'true') {
                articles = await this.storageAPI.getStarredArticles();
            } else {
                articles = await this.storageAPI.getAllArticles(parseInt(limit), parseInt(offset));
            }
            
            res.json({ success: true, data: articles });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    }

    async getArticle(req, res) {
        try {
            const { id } = req.params;
            const article = await this.storageAPI.getArticle(parseInt(id));
            
            if (!article) {
                return res.status(404).json({ success: false, error: 'Article not found' });
            }
            
            res.json({ success: true, data: article });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    }

    async markArticleRead(req, res) {
        try {
            const { id } = req.params;
            await this.storageAPI.markArticleAsRead(parseInt(id));
            res.json({ success: true });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    }

    async toggleArticleStar(req, res) {
        try {
            const { id } = req.params;
            const { starred } = req.body;
            
            await this.storageAPI.toggleArticleStar(parseInt(id), starred);
            res.json({ success: true });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    }

    async getCategories(req, res) {
        try {
            const categories = await this.storageAPI.getAllCategories();
            res.json({ success: true, data: categories });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    }

    async addCategory(req, res) {
        try {
            const { name } = req.body;
            
            if (!name) {
                return res.status(400).json({ success: false, error: 'Category name is required' });
            }
            
            const categoryId = await this.storageAPI.addCategory(name);
            res.json({ success: true, data: { id: categoryId } });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    }

    async searchArticles(req, res) {
        try {
            const { q, limit = 20 } = req.query;
            
            if (!q) {
                return res.status(400).json({ success: false, error: 'Search query is required' });
            }
            
            const results = await this.storageAPI.searchArticles(q, parseInt(limit));
            res.json({ success: true, data: results });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    }

    async getStats(req, res) {
        try {
            const stats = await this.storageAPI.getStatistics();
            res.json({ success: true, data: stats });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    }

    setupErrorHandling() {
        // 404处理
        this.app.use((req, res) => {
            res.status(404).json({ success: false, error: 'Endpoint not found' });
        });
        
        // 错误处理中间件
        this.app.use((error, req, res, next) => {
            console.error('服务器错误:', error);
            res.status(500).json({
                success: false,
                error: process.env.NODE_ENV === 'production' ? 'Internal server error' : error.message
            });
        });
    }

    async start() {
        try {
            await this.initialize();
            
            this.app.listen(this.port, () => {
                console.log(`🚀 RSS服务器运行在 http://localhost:${this.port}`);
                console.log(`📱 打开浏览器访问 http://localhost:${this.port} 开始使用`);
                console.log(`🔧 API文档: http://localhost:${this.port}/api`);
            });
        } catch (error) {
            console.error('启动服务器失败:', error);
            process.exit(1);
        }
    }
}

// 如果是直接运行此文件
if (require.main === module) {
    const server = new RSSServer();
    server.start();
}

module.exports = { RSSServer };