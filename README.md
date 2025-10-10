# 🧭 ChainCredit：科创企业信用评估模型

## 📘 项目简介

**ChainCredit** 是一个为“专精特新”科创企业设计的智能信用风险评估系统。  
项目通过整合 **区块链 (Solana)** 与 **AI 风控模型 (DeepSeek)**，对企业的交易行为、履约数据和产业链互动进行量化建模，  
实现实时的信用风险预测与差异化授信策略支持。

---

## 🎯 项目目标

| 功能模块              | 说明                                                         |
| --------------------- | ------------------------------------------------------------ |
| 🧠 **信用风险预测**   | 基于企业产业链数据、交易活跃度、履约记录，生成动态信用评分。 |
| 💰 **差异化授信策略** | 根据评分结果，推荐差异化授信额度和利率。                     |
| 🔗 **链上数据存证**   | 通过 Solana 区块链实现信用数据可追溯与防篡改。               |

---

## 📦 项目文件结构

**架构：Tauri + Rust + React**

```plaintext
ChainCredit/
│
├── src/                     # 前端 (React)
│   ├── App.tsx              # 主界面入口
│   ├── components/          # 各种 UI 组件
│   │   ├── Admin/           # 区块链管理系统
│   │   ├── ExcelUploader.tsx   # 上传企业数据文件
│   │   ├── AIAssistant/        # AI 助手组件
│   │   └── ThemeContext.tsx    # 主题切换
│   ├── pages/               # 页面路由
│   └── utils/
│       ├── store.ts         # 全局状态管理 (Jotai)
│
├── src-tauri/               # 后端 (Rust)
│   ├── credit/              # Solana 智能合约模块
│   ├── src/main.rs          # Tauri 启动入口
│   ├── src/ai.rs            # AI 模型调用 (DeepSeek)
│   ├── src/solana.rs        # 区块链交互逻辑
│   ├── src/excel.rs         # Excel 数据分析计算
│
├── package.json             # 前端依赖配置
├── Cargo.toml               # Rust 依赖配置
└── README.md                # 项目说明
```

## 🧰 构建与运行

### 一、环境准备

#### 🔹 前端环境

- Node.js = **v24.8.0**
- 推荐使用 **pnpm** 包管理器

#### 🔹 后端环境

- Rust = **1.90**
- 已安装 **Tauri CLI**

安装命令：

```bash
# 安装前端依赖
pnpm install
# Debug
pnpm tauri dev
# Release
pnpm tauri build
```
