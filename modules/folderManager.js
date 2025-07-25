// 文件夹管理器
class FolderManager {
    constructor() {
        this.folders = new Map();
        this.feeds = new Map();
        this.collapsedFolders = new Set();
        this.draggedItem = null;
        this.init();
    }

    init() {
        this.loadData();
        this.bindEvents();
        this.render();
    }

    // 加载数据
    loadData() {
        // 强制清除旧数据，使用新的单层结构
        localStorage.removeItem('folders');
        localStorage.removeItem('feeds');
        localStorage.removeItem('collapsedFolders');
        
        // 初始化默认文件夹结构
        this.initializeDefaultStructure();
    }

    // 初始化默认文件夹结构 - 单层结构
    initializeDefaultStructure() {
        this.folders.set('tech', {
            id: 'tech',
            name: '技术博客',
            order: 0,
            count: 169
        });

        this.folders.set('community', {
            id: 'community',
            name: '开发者社区',
            order: 1,
            count: 117
        });

        // 初始化订阅源
        this.feeds.set('tech-react', {
            id: 'tech-react',
            name: 'React官方博客',
            url: 'https://react.dev/blog',
            folderId: 'tech',
            order: 0,
            count: 89,
            icon: 'fas fa-laptop-code',
            color: '#8b5cf6'
        });

        this.feeds.set('tech-js', {
            id: 'tech-js',
            name: 'JavaScript Weekly',
            url: 'https://javascriptweekly.com',
            folderId: 'tech',
            order: 1,
            count: 80,
            icon: 'fas fa-code',
            color: '#8b5cf6'
        });

        this.feeds.set('dev-to', {
            id: 'dev-to',
            name: 'Dev.to社区',
            url: 'https://dev.to',
            folderId: 'community',
            order: 0,
            count: 6,
            icon: 'fas fa-users',
            color: '#10b981'
        });

        this.feeds.set('frontend-weekly', {
            id: 'frontend-weekly',
            name: '前端周刊',
            url: 'https://frontendfoc.us',
            folderId: 'community',
            order: 1,
            count: 99,
            icon: 'fas fa-newspaper',
            color: '#f59e0b'
        });

        this.feeds.set('podcast', {
            id: 'podcast',
            name: '声动早咖啡',
            url: 'https://podcast.example.com',
            folderId: 'community',
            order: 2,
            count: 12,
            icon: 'fas fa-podcast',
            color: '#06b6d4'
        });

        this.saveData();
    }

    // 保存数据到localStorage
    saveData() {
        localStorage.setItem('folders', JSON.stringify(Array.from(this.folders.entries())));
        localStorage.setItem('feeds', JSON.stringify(Array.from(this.feeds.entries())));
        localStorage.setItem('collapsedFolders', JSON.stringify(Array.from(this.collapsedFolders)));
    }

    // 绑定事件
    bindEvents() {
        // 拖拽事件
        document.addEventListener('dragstart', this.handleDragStart.bind(this));
        document.addEventListener('dragover', this.handleDragOver.bind(this));
        document.addEventListener('drop', this.handleDrop.bind(this));
        document.addEventListener('dragend', this.handleDragEnd.bind(this));
    }

    // 渲染文件夹树
    render() {
        const container = document.getElementById('folderTree');
        if (!container) return;

        const folders = Array.from(this.folders.values())
            .sort((a, b) => a.order - b.order);

        container.innerHTML = '';
        folders.forEach(folder => {
            container.appendChild(this.renderFolder(folder, 0));
        });
    }

    // 渲染单个文件夹
    renderFolder(folder, level = 0) {
        const folderDiv = document.createElement('div');
        folderDiv.className = 'folder-item';
        folderDiv.dataset.folder = folder.id;
        folderDiv.dataset.level = level;

        const isCollapsed = this.collapsedFolders.has(folder.id);
        const childFolders = Array.from(this.folders.values())
            .filter(f => f.parentId === folder.id)
            .sort((a, b) => a.order - b.order);

        const childFeeds = Array.from(this.feeds.values())
            .filter(f => f.folderId === folder.id)
            .sort((a, b) => a.order - b.order);

        const hasChildren = childFolders.length > 0 || childFeeds.length > 0;

        folderDiv.innerHTML = `
            <div class="folder-header ${this.getActiveClass(folder.id)}" 
                 data-folder-id="${folder.id}"
                 ondrop="folderManager.handleFolderDrop(event, '${folder.id}')"
                 ondragover="folderManager.handleDragOver(event)">
                <button class="folder-toggle ${isCollapsed ? 'collapsed' : ''}" 
                        onclick="folderManager.toggleFolder('${folder.id}')"
                        ${!hasChildren ? 'style="visibility: hidden;"' : ''}>
                    <i class="fas fa-chevron-down"></i>
                </button>
                <span class="folder-name">${folder.name}</span>
                <span class="folder-count">${this.getFolderCount(folder.id)}</span>
                <div class="folder-actions">
                    <button class="btn-icon action-btn" onclick="folderManager.editFolder('${folder.id}')" title="编辑">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-icon action-btn" onclick="folderManager.deleteFolder('${folder.id}')" title="删除">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
            <div class="folder-children ${isCollapsed ? 'collapsed' : ''}">
                ${childFolders.map(child => this.renderFolder(child, level + 1).outerHTML).join('')}
                ${childFeeds.map(feed => this.renderFeed(feed, level + 1).outerHTML).join('')}
            </div>
        `;

        return folderDiv;
    }

    // 渲染订阅源
    renderFeed(feed, level = 0) {
        const feedDiv = document.createElement('div');
        feedDiv.className = 'feed-item';
        feedDiv.dataset.feed = feed.id;
        feedDiv.dataset.folder = feed.folderId;
        feedDiv.dataset.level = level;
        feedDiv.draggable = true;

        feedDiv.innerHTML = `
            <i class="feed-icon ${feed.icon}" style="color: ${feed.color};"></i>
            <span class="feed-name">${feed.name}</span>
            <span class="feed-count">${feed.count}</span>
            <div class="feed-actions">
                <button class="btn-icon action-btn" onclick="folderManager.editFeed('${feed.id}')" title="编辑">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn-icon action-btn" onclick="folderManager.deleteFeed('${feed.id}')" title="删除">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;

        return feedDiv;
    }

    // 获取文件夹文章总数
    getFolderCount(folderId) {
        let count = 0;
        
        // 直接属于该文件夹的订阅源
        Array.from(this.feeds.values())
            .filter(feed => feed.folderId === folderId)
            .forEach(feed => count += feed.count);

        return count;
    }

    // 获取激活状态类
    getActiveClass(id) {
        // 这里可以根据当前选中的订阅源或文件夹返回active类
        return '';
    }

    // 折叠/展开文件夹
    toggleFolder(folderId) {
        if (this.collapsedFolders.has(folderId)) {
            this.collapsedFolders.delete(folderId);
        } else {
            this.collapsedFolders.add(folderId);
        }
        this.saveData();
        this.render();
    }

    // 全部折叠/展开
    toggleAllFolders() {
        const allFolderIds = Array.from(this.folders.keys());
        if (this.collapsedFolders.size === allFolderIds.length) {
            this.collapsedFolders.clear();
        } else {
            allFolderIds.forEach(id => this.collapsedFolders.add(id));
        }
        this.saveData();
        this.render();
    }

    // 创建新文件夹
    createFolder() {
        const name = prompt('请输入文件夹名称:');
        if (!name) return;

        const id = 'folder_' + Date.now();
        const newFolder = {
            id: id,
            name: name,
            order: this.getNextOrder(),
            count: 0
        };

        this.folders.set(id, newFolder);
        this.saveData();
        this.render();
    }

    // 编辑文件夹
    editFolder(folderId) {
        const folder = this.folders.get(folderId);
        if (!folder) return;

        const newName = prompt('请输入新的文件夹名称:', folder.name);
        if (newName && newName !== folder.name) {
            folder.name = newName;
            this.saveData();
            this.render();
        }
    }

    // 删除文件夹
    deleteFolder(folderId) {
        if (folderId === 'root') {
            alert('根文件夹不能删除');
            return;
        }

        const folder = this.folders.get(folderId);
        if (!folder) return;

        if (!confirm(`确定要删除文件夹 "${folder.name}" 吗？`)) return;

            // 删除文件夹下的所有订阅源
        Array.from(this.feeds.values())
            .filter(feed => feed.folderId === folderId)
            .forEach(feed => this.feeds.delete(feed.id));
        this.folders.delete(folderId);
        this.collapsedFolders.delete(folderId);

        this.saveData();
        this.render();
    }

    // 编辑订阅源
    editFeed(feedId) {
        const feed = this.feeds.get(feedId);
        if (!feed) return;

        const newName = prompt('请输入新的订阅源名称:', feed.name);
        if (newName && newName !== feed.name) {
            feed.name = newName;
            this.saveData();
            this.render();
        }
    }

    // 删除订阅源
    deleteFeed(feedId) {
        const feed = this.feeds.get(feedId);
        if (!feed) return;

        if (!confirm(`确定要删除订阅源 "${feed.name}" 吗？`)) return;

        this.feeds.delete(feedId);
        this.saveData();
        this.render();
    }

    // 获取下一个排序值
    getNextOrder() {
        return Array.from(this.folders.values()).length;
    }

    // 拖拽开始
    handleDragStart(e) {
        if (!e.target.classList.contains('feed-item')) return;
        
        this.draggedItem = {
            type: 'feed',
            id: e.target.dataset.feed,
            element: e.target
        };
        
        e.target.classList.add('dragging');
        e.dataTransfer.effectAllowed = 'move';
    }

    // 拖拽悬停
    handleDragOver(e) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';

        // 添加拖拽悬停效果
        const target = e.target.closest('.feed-item, .folder-header');
        if (target) {
            target.classList.add('drag-over');
        }
    }

    // 拖拽结束
    handleDragEnd(e) {
        if (e.target.classList.contains('feed-item')) {
            e.target.classList.remove('dragging');
        }
        
        // 移除所有拖拽悬停效果
        document.querySelectorAll('.drag-over').forEach(el => {
            el.classList.remove('drag-over');
        });
        
        this.draggedItem = null;
    }

    // 放置到文件夹
    handleFolderDrop(e, folderId) {
        e.preventDefault();
        
        if (!this.draggedItem || this.draggedItem.type !== 'feed') return;

        const feed = this.feeds.get(this.draggedItem.id);
        if (feed) {
            feed.folderId = folderId;
            this.saveData();
            this.render();
        }
    }

    // 放置到订阅源
    handleDrop(e) {
        e.preventDefault();
        
        if (!this.draggedItem) return;

        // 处理订阅源重排序
        const target = e.target.closest('.feed-item');
        if (target && this.draggedItem.type === 'feed') {
            const targetFeedId = target.dataset.feed;
            const draggedFeed = this.feeds.get(this.draggedItem.id);
            const targetFeed = this.feeds.get(targetFeedId);
            
            if (draggedFeed && targetFeed && draggedFeed.folderId === targetFeed.folderId) {
                // 在同一文件夹内重排序
                const feedsInFolder = Array.from(this.feeds.values())
                    .filter(f => f.folderId === draggedFeed.folderId)
                    .sort((a, b) => a.order - b.order);
                
                const draggedIndex = feedsInFolder.findIndex(f => f.id === this.draggedItem.id);
                const targetIndex = feedsInFolder.findIndex(f => f.id === targetFeedId);
                
                if (draggedIndex !== -1 && targetIndex !== -1) {
                    feedsInFolder.splice(draggedIndex, 1);
                    feedsInFolder.splice(targetIndex, 0, draggedFeed);
                    
                    feedsInFolder.forEach((feed, index) => {
                        feed.order = index;
                    });
                    
                    this.saveData();
                    this.render();
                }
            }
        }
    }



    // 导出数据
    exportData() {
        return {
            folders: Array.from(this.folders.values()),
            feeds: Array.from(this.feeds.values()),
            collapsedFolders: Array.from(this.collapsedFolders)
        };
    }

    // 导入数据
    importData(data) {
        if (data.folders) {
            this.folders = new Map(data.folders.map(f => [f.id, f]));
        }
        if (data.feeds) {
            this.feeds = new Map(data.feeds.map(f => [f.id, f]));
        }
        if (data.collapsedFolders) {
            this.collapsedFolders = new Set(data.collapsedFolders);
        }
        this.saveData();
        this.render();
    }
}

// 全局实例
const folderManager = new FolderManager();

// 全局函数（供HTML调用）
function createFolder() {
    folderManager.createFolder();
}

function toggleAllFolders() {
    folderManager.toggleAllFolders();
}

function toggleFolder(folderId) {
    folderManager.toggleFolder(folderId);
}

function editFolder(folderId) {
    folderManager.editFolder(folderId);
}

function deleteFolder(folderId) {
    folderManager.deleteFolder(folderId);
}

function editFeed(feedId) {
    folderManager.editFeed(feedId);
}

function deleteFeed(feedId) {
    folderManager.deleteFeed(feedId);
}

// 导出供其他模块使用
if (typeof module !== 'undefined' && module.exports) {
    module.exports = FolderManager;
}