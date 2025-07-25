class RSSReader {
    constructor() {
        this.currentTheme = 'light';
        this.currentFilter = 'all';
        this.currentFeed = null;
        this.currentArticle = null;
        this.articles = [];
        this.feeds = [];
        this.categories = [];
        
        this.init();
    }

    async init() {
        this.setupEventListeners();
        this.loadTheme();
        this.loadData();
        this.render();
    }

    setupEventListeners() {
        // 主题切换
        document.getElementById('themeToggle').addEventListener('click', () => {
            this.toggleTheme();
        });

        // 菜单切换
        document.getElementById('menuToggle').addEventListener('click', () => {
            this.toggleSidebar();
        });

        // 搜索
        document.getElementById('searchInput').addEventListener('input', (e) => {
            this.handleSearch(e.target.value);
        });

        // 刷新
        document.getElementById('refreshBtn').addEventListener('click', () => {
            this.refreshData();
        });

        // 设置
        document.getElementById('settingsBtn').addEventListener('click', () => {
            this.showSettings();
        });

        // 添加RSS源
        document.getElementById('addFeedBtn').addEventListener('click', () => {
            this.showAddFeedModal();
        });

        // 排序
        document.getElementById('sortSelect').addEventListener('change', (e) => {
            this.sortArticles(e.target.value);
        });

        // 全部已读
        document.getElementById('markAllReadBtn').addEventListener('click', () => {
            this.markAllAsRead();
        });

        // 模态框事件
        document.getElementById('closeAddFeedModal').addEventListener('click', () => {
            this.hideAddFeedModal();
        });

        document.getElementById('cancelAddFeed').addEventListener('click', () => {
            this.hideAddFeedModal();
        });

        document.getElementById('closeSettingsModal').addEventListener('click', () => {
            this.hideSettingsModal();
        });

        document.getElementById('addFeedForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.addFeed();
        });

        // 设置面板事件
        document.getElementById('themeSelect').addEventListener('change', (e) => {
            this.setTheme(e.target.value);
        });

        document.getElementById('fontSizeSlider').addEventListener('input', (e) => {
            this.setFontSize(e.target.value);
        });

        // 点击模态框外部关闭
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.classList.remove('active');
                }
            });
        });
    }

    loadTheme() {
        const savedTheme = localStorage.getItem('rss-theme') || 'light';
        this.setTheme(savedTheme);
    }

    setTheme(theme) {
        this.currentTheme = theme;
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('rss-theme', theme);
        
        const icon = document.querySelector('#themeToggle i');
        if (theme === 'dark') {
            icon.className = 'fas fa-sun';
        } else {
            icon.className = 'fas fa-moon';
        }
        
        document.getElementById('themeSelect').value = theme;
    }

    toggleTheme() {
        const newTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        this.setTheme(newTheme);
    }

    setFontSize(size) {
        document.documentElement.style.setProperty('--base-font-size', `${size}px`);
        document.getElementById('fontSizeValue').textContent = `${size}px`;
        localStorage.setItem('rss-font-size', size);
    }

    toggleSidebar() {
        const sidebar = document.getElementById('sidebar');
        sidebar.classList.toggle('open');
    }

    async loadData() {
        try {
            this.showLoading('articleList');
            
            // 模拟从API获取数据
            await this.simulateDataLoad();
            
            this.renderSidebar();
            this.renderArticleList();
            this.hideLoading('articleList');
        } catch (error) {
            console.error('加载数据失败:', error);
            this.showError('加载数据失败，请重试');
        }
    }

    async simulateDataLoad() {
        // 模拟延迟加载
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // 模拟数据
        this.categories = [
            { id: 1, name: '技术', count: 15 },
            { id: 2, name: '新闻', count: 8 },
            { id: 3, name: '博客', count: 12 }
        ];

        this.feeds = [
            { id: 1, name: '技术博客', url: 'https://example.com/tech', category: '技术', count: 8 },
            { id: 2, name: '新闻网站', url: 'https://example.com/news', category: '新闻', count: 5 },
            { id: 3, name: '开发者社区', url: 'https://example.com/dev', category: '技术', count: 7 }
        ];

        this.articles = [
            {
                id: 1,
                title: '深入理解微内核架构设计',
                content: '<p>微内核架构是一种软件设计模式，它将系统的核心功能最小化，其他功能以插件或模块的形式实现...</p><p>这种架构的优势在于...</p>',
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
                content: '<p>在信息爆炸的时代，如何有效地管理和阅读RSS订阅变得尤为重要...</p>',
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
                content: '<p>响应式设计不仅仅是媒体查询，它需要考虑用户体验、性能优化和可访问性...</p>',
                source: '技术博客',
                date: new Date(Date.now() - 86400000),
                url: 'https://example.com/article3',
                isRead: true,
                isStarred: false,
                snippet: '分享响应式设计的最佳实践和常见陷阱...'
            }
        ];
    }

    render() {
        this.renderSidebar();
        this.renderArticleList();
    }

    renderSidebar() {
        // 渲染分类
        const categoryList = document.getElementById('categoryList');
        categoryList.innerHTML = '';
        
        this.categories.forEach(category => {
            const li = document.createElement('li');
            li.className = 'category-item';
            li.innerHTML = `
                <i class="fas fa-folder"></i>
                <span>${category.name}</span>
                <span class="count">${category.count}</span>
            `;
            li.addEventListener('click', () => this.filterByCategory(category.name));
            categoryList.appendChild(li);
        });

        // 渲染RSS源
        const feedList = document.getElementById('feedList');
        feedList.innerHTML = '';
        
        this.feeds.forEach(feed => {
            const li = document.createElement('li');
            li.className = 'feed-item';
            li.innerHTML = `
                <i class="fas fa-rss"></i>
                <span>${feed.name}</span>
                <span class="count">${feed.count}</span>
            `;
            li.addEventListener('click', () => this.filterByFeed(feed.id));
            feedList.appendChild(li);
        });

        // 更新分类选择器
        const categorySelect = document.getElementById('feedCategory');
        categorySelect.innerHTML = '<option value="">选择分类</option>';
        this.categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category.name;
            option.textContent = category.name;
            categorySelect.appendChild(option);
        });
    }

    renderArticleList() {
        const articleList = document.getElementById('articleList');
        const filteredArticles = this.getFilteredArticles();
        
        if (filteredArticles.length === 0) {
            articleList.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-inbox"></i>
                    <h3>暂无文章</h3>
                    <p>当前没有符合条件的文章</p>
                </div>
            `;
            return;
        }

        articleList.innerHTML = '';
        
        filteredArticles.forEach(article => {
            const div = document.createElement('div');
            div.className = `article-item ${article.isRead ? '' : 'unread'} ${article.id === this.currentArticle?.id ? 'active' : ''}`;
            div.innerHTML = `
                <div class="article-item-header">
                    <span class="article-source">${article.source}</span>
                    <span class="article-date">${this.formatDate(article.date)}</span>
                </div>
                <h3 class="article-title">${article.title}</h3>
                <p class="article-snippet">${article.snippet}</p>
            `;
            div.addEventListener('click', () => this.selectArticle(article));
            articleList.appendChild(div);
        });
    }

    getFilteredArticles() {
        let filtered = [...this.articles];

        switch (this.currentFilter) {
            case 'unread':
                filtered = filtered.filter(article => !article.isRead);
                break;
            case 'starred':
                filtered = filtered.filter(article => article.isStarred);
                break;
            case 'feed':
                if (this.currentFeed) {
                    filtered = filtered.filter(article => article.source === this.currentFeed);
                }
                break;
        }

        return filtered;
    }

    filterByCategory(category) {
        this.currentFilter = 'category';
        this.currentFeed = category;
        document.getElementById('currentViewTitle').textContent = category;
        this.renderArticleList();
    }

    filterByFeed(feedId) {
        const feed = this.feeds.find(f => f.id === feedId);
        if (feed) {
            this.currentFilter = 'feed';
            this.currentFeed = feed.name;
            document.getElementById('currentViewTitle').textContent = feed.name;
            this.renderArticleList();
        }
    }

    selectArticle(article) {
        this.currentArticle = article;
        this.renderArticleList();
        this.renderArticle();
        
        // 标记为已读
        if (!article.isRead) {
            article.isRead = true;
            this.renderArticleList();
        }
    }

    renderArticle() {
        const reader = document.getElementById('articleReader');
        
        if (!this.currentArticle) {
            reader.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-newspaper"></i>
                    <h3>选择一篇文章开始阅读</h3>
                    <p>点击左侧的文章列表，开始阅读RSS内容</p>
                </div>
            `;
            return;
        }

        reader.innerHTML = `
            <div class="article-content">
                <div class="article-header">
                    <h1>${this.currentArticle.title}</h1>
                    <div class="article-meta">
                        <span class="article-source">${this.currentArticle.source}</span>
                        <span class="article-date">${this.formatDate(this.currentArticle.date)}</span>
                        <div class="article-actions">
                            <button class="btn btn-sm ${this.currentArticle.isStarred ? 'btn-primary' : 'btn-secondary'}" onclick="app.toggleStar()">
                                <i class="fas fa-star"></i>
                                ${this.currentArticle.isStarred ? '取消收藏' : '收藏'}
                            </button>
                            <a href="${this.currentArticle.url}" target="_blank" class="btn btn-secondary">
                                <i class="fas fa-external-link-alt"></i>
                                原文链接
                            </a>
                        </div>
                    </div>
                </div>
                <div class="article-body">
                    ${this.currentArticle.content}
                </div>
            </div>
        `;
    }

    toggleStar() {
        if (this.currentArticle) {
            this.currentArticle.isStarred = !this.currentArticle.isStarred;
            this.renderArticle();
            this.renderArticleList();
        }
    }

    handleSearch(query) {
        if (!query.trim()) {
            this.renderArticleList();
            return;
        }

        const filtered = this.articles.filter(article =>
            article.title.toLowerCase().includes(query.toLowerCase()) ||
            article.content.toLowerCase().includes(query.toLowerCase()) ||
            article.source.toLowerCase().includes(query.toLowerCase())
        );

        this.renderFilteredArticles(filtered);
    }

    sortArticles(sortBy) {
        // 实现排序逻辑
        console.log('排序方式:', sortBy);
    }

    markAllAsRead() {
        this.articles.forEach(article => {
            article.isRead = true;
        });
        this.renderArticleList();
    }

    refreshData() {
        this.loadData();
    }

    showAddFeedModal() {
        document.getElementById('addFeedModal').classList.add('active');
    }

    hideAddFeedModal() {
        document.getElementById('addFeedModal').classList.remove('active');
        document.getElementById('addFeedForm').reset();
    }

    showSettings() {
        document.getElementById('settingsModal').classList.add('active');
    }

    hideSettingsModal() {
        document.getElementById('settingsModal').classList.remove('active');
    }

    async addFeed() {
        const url = document.getElementById('feedUrl').value;
        const category = document.getElementById('feedCategory').value;
        
        if (!url) return;

        try {
            // 这里应该调用实际的API添加RSS源
            console.log('添加RSS源:', { url, category });
            
            this.hideAddFeedModal();
            this.refreshData();
        } catch (error) {
            console.error('添加RSS源失败:', error);
            alert('添加RSS源失败，请检查URL是否正确');
        }
    }

    showLoading(containerId) {
        const container = document.getElementById(containerId);
        if (container) {
            container.innerHTML = `
                <div class="loading">
                    <i class="fas fa-spinner fa-spin"></i>
                    <span>加载中...</span>
                </div>
            `;
        }
    }

    hideLoading(containerId) {
        const container = document.getElementById(containerId);
        if (container) {
            const loading = container.querySelector('.loading');
            if (loading) {
                loading.remove();
            }
        }
    }

    showError(message) {
        const articleList = document.getElementById('articleList');
        articleList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-exclamation-triangle"></i>
                <h3>出错了</h3>
                <p>${message}</p>
                <button class="btn btn-primary" onclick="app.refreshData()">重试</button>
            </div>
        `;
    }

    formatDate(date) {
        if (!(date instanceof Date)) {
            date = new Date(date);
        }
        
        const now = new Date();
        const diff = now - date;
        
        if (diff < 60000) {
            return '刚刚';
        } else if (diff < 3600000) {
            return `${Math.floor(diff / 60000)}分钟前`;
        } else if (diff < 86400000) {
            return `${Math.floor(diff / 3600000)}小时前`;
        } else if (diff < 604800000) {
            return `${Math.floor(diff / 86400000)}天前`;
        } else {
            return date.toLocaleDateString('zh-CN');
        }
    }
}

// 初始化应用
const app = new RSSReader();

// 全局函数
function toggleArticleReader() {
    const reader = document.getElementById('articleReaderContainer');
    reader.classList.toggle('active');
}

// 键盘快捷键
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        document.querySelectorAll('.modal').forEach(modal => {
            modal.classList.remove('active');
        });
        
        const sidebar = document.getElementById('sidebar');
        if (sidebar.classList.contains('open')) {
            sidebar.classList.remove('open');
        }
        
        const reader = document.getElementById('articleReaderContainer');
        if (reader.classList.contains('active')) {
            reader.classList.remove('active');
        }
    }
    
    // Ctrl/Cmd + K 聚焦搜索
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        document.getElementById('searchInput').focus();
    }
    
    // Ctrl/Cmd + R 刷新
    if ((e.ctrlKey || e.metaKey) && e.key === 'r') {
        e.preventDefault();
        app.refreshData();
    }
});

// 页面加载完成后的初始化
document.addEventListener('DOMContentLoaded', () => {
    // 加载保存的字体大小
    const savedFontSize = localStorage.getItem('rss-font-size');
    if (savedFontSize) {
        document.getElementById('fontSizeSlider').value = savedFontSize;
        app.setFontSize(savedFontSize);
    }
});