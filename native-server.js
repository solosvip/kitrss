import { createServer } from 'http';
import { readFile } from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 纯原生HTTP服务器
class NativeServer {
    constructor(port = 3000) {
        this.port = port;
        this.mimeTypes = {
            '.html': 'text/html',
            '.css': 'text/css',
            '.js': 'application/javascript',
            '.json': 'application/json',
            '.png': 'image/png',
            '.jpg': 'image/jpeg',
            '.jpeg': 'image/jpeg',
            '.gif': 'image/gif',
            '.svg': 'image/svg+xml',
            '.ico': 'image/x-icon',
            '.woff': 'font/woff',
            '.woff2': 'font/woff2',
            '.ttf': 'font/ttf',
            '.eot': 'font/eot'
        };
        
        this.server = createServer(this.handleRequest.bind(this));
        this.setupRoutes();
    }

    setupRoutes() {
        // 内存中的模拟数据
        this.data = {
            feeds: [
                { id: 1, name: '技术博客', url: 'https://example.com/tech', category: '技术', count: 8 },
                { id: 2, name: '新闻网站', url: 'https://example.com/news', category: '新闻', count: 5 },
                { id: 3, name: '开发者社区', url: 'https://example.com/dev', category: '技术', count: 7 }
            ],
            categories: [
                { id: 1, name: '技术', count: 15 },
                { id: 2, name: '新闻', count: 8 },
                { id: 3, name: '博客', count: 12 }
            ],
            articles: [
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
            ]
        };
    }

    async handleRequest(req, res) {
        const url = new URL(req.url, `http://${req.headers.host}`);
        const pathname = url.pathname;

        // 设置CORS头
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

        if (req.method === 'OPTIONS') {
            res.writeHead(200);
            res.end();
            return;
        }

        try {
            // API路由
            if (pathname.startsWith('/api/')) {
                await this.handleAPI(req, res, pathname, url);
                return;
            }

            // 静态文件服务
            await this.handleStaticFile(req, res, pathname);
        } catch (error) {
            console.error('Error handling request:', error);
            res.writeHead(500, { 'Content-Type': 'text/plain' });
            res.end('Internal Server Error');
        }
    }

    async handleAPI(req, res, pathname, url) {
        const searchParams = url.searchParams;

        // 设置JSON响应头
        res.setHeader('Content-Type', 'application/json');

        // 路由匹配
        if (pathname === '/api/feeds' && req.method === 'GET') {
            res.writeHead(200);
            res.end(JSON.stringify({ success: true, data: this.data.feeds }));
        } else if (pathname === '/api/categories' && req.method === 'GET') {
            res.writeHead(200);
            res.end(JSON.stringify({ success: true, data: this.data.categories }));
        } else if (pathname === '/api/articles' && req.method === 'GET') {
            const unread = searchParams.get('unread');
            const starred = searchParams.get('starred');
            const feedId = searchParams.get('feedId');
            
            let articles = [...this.data.articles];

            if (unread === 'true') {
                articles = articles.filter(a => !a.isRead);
            }
            if (starred === 'true') {
                articles = articles.filter(a => a.isStarred);
            }
            if (feedId) {
                const feed = this.data.feeds.find(f => f.id === parseInt(feedId));
                if (feed) {
                    articles = articles.filter(a => a.source === feed.name);
                }
            }

            // 转换日期为ISO字符串以便JSON序列化
            articles = articles.map(a => ({
                ...a,
                date: a.date.toISOString()
            }));

            res.writeHead(200);
            res.end(JSON.stringify({ success: true, data: articles }));
        } else if (pathname === '/api/search' && req.method === 'GET') {
            const q = searchParams.get('q');
            if (!q) {
                res.writeHead(400);
                res.end(JSON.stringify({ success: false, error: 'Query is required' }));
                return;
            }

            const results = this.data.articles.filter(a => 
                a.title.toLowerCase().includes(q.toLowerCase()) ||
                a.content.toLowerCase().includes(q.toLowerCase())
            ).map(a => ({
                ...a,
                date: a.date.toISOString()
            }));

            res.writeHead(200);
            res.end(JSON.stringify({ success: true, data: results }));
        } else if (pathname === '/api/stats' && req.method === 'GET') {
            const stats = {
                totalFeeds: this.data.feeds.length,
                totalArticles: this.data.articles.length,
                unreadArticles: this.data.articles.filter(a => !a.isRead).length,
                starredArticles: this.data.articles.filter(a => a.isStarred).length,
                lastUpdate: new Date().toISOString()
            };
            res.writeHead(200);
            res.end(JSON.stringify({ success: true, data: stats }));
        } else if (pathname === '/health' && req.method === 'GET') {
            res.writeHead(200);
            res.end(JSON.stringify({ status: 'ok', timestamp: new Date().toISOString() }));
        } else {
            res.writeHead(404);
            res.end(JSON.stringify({ success: false, error: 'Endpoint not found' }));
        }
    }

    async handleStaticFile(req, res, pathname) {
        // 默认首页
        if (pathname === '/') {
            pathname = '/index.html';
        }

        // 移除前导斜杠
        const filePath = pathname.startsWith('/') ? pathname.slice(1) : pathname;
        const fullPath = join(__dirname, filePath);

        try {
            const data = await readFile(fullPath);
            const ext = pathname.substring(pathname.lastIndexOf('.'));
            const contentType = this.mimeTypes[ext] || 'text/plain';

            res.writeHead(200, { 'Content-Type': contentType });
            res.end(data);
        } catch (error) {
            if (error.code === 'ENOENT') {
                // 尝试从CDN加载Font Awesome
                if (pathname.includes('fontawesome')) {
                    res.writeHead(302, { 'Location': 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css' });
                    res.end();
                    return;
                }

                res.writeHead(404, { 'Content-Type': 'text/plain' });
                res.end('File not found');
            } else {
                res.writeHead(500, { 'Content-Type': 'text/plain' });
                res.end('Error reading file');
            }
        }
    }

    start() {
        this.server.listen(this.port, () => {
            console.log('🚀 RSS阅读器已启动！');
            console.log(`📱 打开浏览器访问: http://localhost:${this.port}`);
            console.log(`🔧 API测试: http://localhost:${this.port}/health`);
            console.log(`📚 文章列表: http://localhost:${this.port}/api/articles`);
            console.log('');
            console.log('💡 使用提示：');
            console.log('  - 点击左侧菜单可以筛选文章');
            console.log('  - 支持明暗主题切换');
            console.log('  - 使用搜索框快速查找文章');
            console.log('  - 按ESC键关闭弹窗');
            console.log('  - 按Ctrl+K聚焦搜索框');
            console.log('  - 按Ctrl+R刷新数据');
        });
    }
}

// 启动服务器
const server = new NativeServer(3000);
server.start();