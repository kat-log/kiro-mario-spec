# Mario Style Platformer

HTML5 Canvas と JavaScript で作られたマリオ風横スクロールアクションゲームです。

## 🎮 ゲーム概要

クラシックなマリオスタイルのプラットフォーマーゲームを Web ブラウザで楽しめます。プレイヤーはキャラクターを操作してステージを進み、コインを集め、ゴールを目指します。

## ✨ 主な機能

### 基本機能

- **プレイヤー操作**: 左右移動、ジャンプ、ダッシュ、しゃがみ
- **物理エンジン**: 重力、衝突判定、摩擦システム
- **カメラシステム**: プレイヤーに追従するスムーズなスクロール
- **アイテムシステム**: コイン収集、パワーアップアイテム
- **音響効果**: ジャンプ、アイテム取得、ゴール到達時の効果音
- **UI システム**: スコア表示、メニュー画面、設定画面

### 高度な機能

- **パフォーマンス最適化**: FPS 監視、メモリ使用量最適化
- **ブラウザ互換性**: 各種ブラウザでの動作保証
- **デバッグシステム**: 統合テスト、システム検証機能
- **セーブシステム**: ゲーム進行状況の保存（準備中）

## 🎯 操作方法

| キー         | 動作              |
| ------------ | ----------------- |
| ← →          | 左右移動          |
| ↑ / Space    | ジャンプ          |
| Shift + 移動 | ダッシュ          |
| ↓            | しゃがみ/ブロック |
| P            | ポーズ            |
| Esc          | メニューに戻る    |

### デバッグ機能

| キー | 機能                               |
| ---- | ---------------------------------- |
| F1   | パフォーマンスオーバーレイ表示切替 |
| F2   | 統合テスト実行                     |
| F3   | システム検証実行                   |
| F4   | システムヘルスチェック             |
| F5   | パフォーマンスレポート生成         |
| F7   | ブラウザ互換性チェック             |
| F8   | バグ検出実行                       |

## 🚀 セットアップ

### 必要な環境

- モダンな Web ブラウザ（Chrome、Firefox、Safari、Edge）
- ローカル Web サーバー（開発時）

### 実行方法

1. **リポジトリをクローン**

```bash
git clone <repository-url>
cd mario-style-platformer
```

2. **ローカルサーバーで実行**

```bash
# Python 3の場合
python -m http.server 8000

# Node.jsの場合
npx serve .

# VS Codeの場合
Live Server拡張機能を使用
```

3. **ブラウザでアクセス**

```
http://localhost:8000
```

## 📁 プロジェクト構造

```
mario-style-platformer/
├── index.html              # メインHTMLファイル
├── styles/
│   └── main.css            # スタイルシート
├── js/
│   ├── main.js             # ゲームエンジンのメインファイル
│   ├── player.js           # プレイヤークラス
│   ├── physics-engine.js   # 物理エンジン
│   ├── input-manager.js    # 入力管理
│   ├── camera.js           # カメラシステム
│   ├── stage.js            # ステージ管理
│   ├── item.js             # アイテムシステム
│   ├── audio-manager.js    # 音響管理
│   ├── ui-system.js        # UIシステム
│   ├── scene-manager.js    # シーン管理
│   ├── save-system.js      # セーブシステム
│   └── ...                 # その他のモジュール
├── .kiro/
│   └── specs/              # 仕様書とタスク管理
└── test files/             # テスト用HTMLファイル
```

## 🔧 開発者向け情報

### アーキテクチャ

ゲームは以下の主要コンポーネントで構成されています：

- **GameEngine**: ゲームループとメイン制御
- **PhysicsEngine**: 物理計算（重力、衝突判定）
- **InputManager**: キーボード入力の管理
- **Camera**: ビューポート制御
- **SceneManager**: シーン遷移管理
- **AudioManager**: 音響効果管理

### テスト機能

開発者コンソールで以下のコマンドが使用できます：

```javascript
// テストヘルプを表示
TestRunner.showHelp();

// 統合テストを実行
TestRunner.runIntegrationTests();

// システム検証を実行
TestRunner.runSystemValidation();

// パフォーマンステストを実行
TestRunner.runPerformanceTests();
```

### デバッグ機能

- リアルタイム FPS 表示
- プレイヤー位置・速度表示
- 物理エンジンの状態表示
- メモリ使用量監視
- ブラウザ互換性チェック

## 🎨 カスタマイズ

### ゲーム設定の変更

`js/main.js`の`GAME_CONFIG`オブジェクトで基本設定を変更できます：

```javascript
const GAME_CONFIG = {
  canvas: {
    width: 800, // キャンバス幅
    height: 600, // キャンバス高さ
  },
  targetFPS: 60, // 目標FPS
  maxDeltaTime: 1000 / 30, // 最大フレーム時間
};
```

### 物理パラメータの調整

`js/physics-engine.js`で物理定数を調整できます：

```javascript
this.constants = {
  gravity: 980, // 重力加速度
  friction: 0.8, // 摩擦係数
  airResistance: 0.98, // 空気抵抗
  // ...
};
```

## 🚧 開発ロードマップ

### Phase 1: 基本機能 ✅

- [x] プレイヤー操作システム
- [x] 物理エンジン
- [x] ステージシステム
- [x] アイテム収集
- [x] 音響効果

### Phase 2: 拡張機能 🚧

- [ ] セーブ機能
- [ ] ステージ選択画面
- [ ] 複数ステージ
- [ ] BGM システム

### Phase 3: 高度な機能 📋

- [ ] ステージエディター
- [ ] オンラインマルチプレイヤー
- [ ] フレンドシステム
- [ ] カスタムステージ共有

## 🤝 コントリビューション

1. このリポジトリをフォーク
2. 機能ブランチを作成 (`git checkout -b feature/amazing-feature`)
3. 変更をコミット (`git commit -m 'Add amazing feature'`)
4. ブランチにプッシュ (`git push origin feature/amazing-feature`)
5. プルリクエストを作成

## 📄 ライセンス

このプロジェクトは MIT ライセンスの下で公開されています。

## 🙏 謝辞

- クラシックなマリオゲームシリーズからのインスピレーション
- HTML5 Canvas API とモダン JavaScript 機能の活用

---

**楽しいゲーム体験をお楽しみください！** 🎮✨
