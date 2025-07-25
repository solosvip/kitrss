# RSS阅读器 - 模块化架构实现

一个基于微内核架构的现代化RSS阅读器，支持高度模块化和插件化扩展。

## 🏗️ 项目架构

### 核心设计原则
- **完全解耦**: 所有模块通过接口和事件系统通信
- **API抽象**: 所有外部依赖通过API层访问
- **插件系统**: 支持动态加载和卸载功能模块
- **数据存储抽象**: 存储实现可替换（SQLite/PostgreSQL/MongoDB等）

### 项目结构
```
rssbak/
├── core/                    # 核心系统
│   ├── kernel.js           # 微内核调度器
│   └── event-bus.js        # 事件总线实现
├── contracts/              # 接口契约
│   ├── module-interface.js # 模块接口定义
│   ├── storage-interface.js # 存储接口定义
│   └── event-interface.js  # 事件接口定义
├── modules/                # 功能模块
│   ├── data/
│   │   ├── storage/        # 数据存储实现
│   │   │   └── sqlite-storage.js
│   │   └── rss-parser/     # RSS解析模块
│   │       └── rss-parser.js
│   └── ui/                 # 界面模块（待实现）
├── apis/                   # API层
│   └── storage-apis.js     # 存储API
├── config/                 # 配置文件
├── public/                 # 静态资源
│   ├── css/
│   └── js/
├── tests/                  # 测试文件
├── main.js                 # 主入口
├── package.json            # 项目配置
└── README.md              # 项目文档
```

## 🚀 快速开始

### 安装依赖
```bash
npm install
```

### 启动项目
```bash
# 开发模式
npm run dev

# 生产模式
npm start
```

### 测试
```bash
npm test
```

## 📊 当前功能状态

### ✅ 已完成
- [x] 微内核架构设计
- [x] 事件总线系统
- [x] SQLite存储实现
- [x] RSS解析器
- [x] 存储API抽象层
- [x] 核心服务初始化

### 🔄 待实现
- [ ] UI界面模块
- [ ] Web服务器
- [ ] RSS源管理
- [ ] 文章阅读器
- [ ] 搜索功能
- [ ] 书签系统
- [ ] 用户偏好设置
- [ ] 数据同步
- [ ] 插件系统

## 🔧 核心功能

### 1. 数据存储 (SQLite)
- RSS源管理（添加、更新、删除）
- 文章管理（标记已读、收藏、搜索）
- 分类管理
- 书签系统
- 用户偏好设置
- 阅读进度跟踪
- 数据备份和恢复

### 2. RSS解析
- 支持标准RSS 2.0和Atom 1.0
- 自动提取文章元数据
- 图片和标签提取
- 批量解析
- 源验证

### 3. 事件系统
- 基于发布-订阅模式
- 支持同步和异步事件
- 事件历史记录
- 错误处理机制

## 📋 API文档

### 存储API示例
```javascript
import { startRSSReader } from './main.js'

const system = await startRSSReader()
const { storage } = system

// 添加RSS源
const feed = await storage.addFeed({
  url: 'https://example.com/rss',
  title: '示例RSS源',
  category_id: 1
})

// 获取文章
const articles = await storage.getArticles({
  is_read: false,
  limit: 20,
  offset: 0
})

// 搜索文章
const results = await storage.searchArticles('关键词')
```

### 事件系统示例
```javascript
import { eventBus } from './core/event-bus.js'

// 订阅事件
eventBus.subscribe('article:added', (data) => {
  console.log('新文章添加:', data.title)
})

// 发布事件
await eventBus.publish('custom:event', { message: 'Hello World' })
```

## 🔌 扩展开发

### 创建新模块
1. 实现接口契约
2. 注册到内核
3. 监听相关事件

### 示例模块
```javascript
import { IModule } from './contracts/module-interface.js'

export class MyModule extends IModule {
  getName() { return 'my-module' }
  getVersion() { return '1.0.0' }
  getDependencies() { return ['storage'] }
  
  async init(config) {
    // 模块初始化
  }
  
  async activate() {
    // 模块激活
  }
  
  async deactivate() {
    // 模块停用
  }
}
```

## 🐛 调试

### 查看系统状态
```javascript
import { getSystemStatus } from './main.js'

const status = getSystemStatus()
console.log(status)
```

### 事件调试
```javascript
import { eventBus } from './core/event-bus.js'

// 查看事件信息
console.log(eventBus.getDebugInfo())
```

## 📁 数据文件

- **数据库**: `./data/rss-reader.db`
- **日志**: `./logs/`
- **备份**: `./backups/`
- **配置**: `./config/`

## 🎯 下一步计划

1. **Web界面**: 实现响应式Web UI
2. **API服务器**: 创建RESTful API
3. **同步功能**: 支持多设备同步
4. **通知系统**: 新文章提醒
5. **插件市场**: 支持第三方插件

## 🤝 贡献

欢迎提交Issue和Pull Request！

## 📄 许可证

MIT License - 详见LICENSE文件