# Requirements Document

## Introduction

スーパーマリオ風の横スクロールアクションゲームを開発します。HTML、CSS、JavaScript を使用して Web ブラウザで遊べるゲームとして実装し、将来的にはバックエンドとセーブ機能を追加する予定です。MVP ではフロントエンド技術のみで動作し、フェーズ 2 でセーブ機能とバックエンド連携を実装します。

## Requirements

### Requirement 1: 基本的なプレイヤー操作

**User Story:** プレイヤーとして、キャラクターを自由に操作してゲーム世界を移動したい

#### Acceptance Criteria

1. WHEN プレイヤーが左右の矢印キーを押す THEN キャラクターは対応する方向に移動する SHALL
2. WHEN プレイヤーがスペースキーまたは上矢印キーを押す THEN キャラクターはジャンプする SHALL
3. WHEN プレイヤーが Shift キーを押しながら移動する THEN キャラクターはダッシュする SHALL
4. WHEN プレイヤーがダウンキーを押す THEN キャラクターはしゃがんでブロックする SHALL

### Requirement 2: ゲーム世界とステージ

**User Story:** プレイヤーとして、横スクロールするステージでプラットフォームアクションを楽しみたい

#### Acceptance Criteria

1. WHEN ゲームが開始される THEN 横スクロール可能なステージが表示される SHALL
2. WHEN キャラクターが画面端に到達する THEN カメラがキャラクターに追従してスクロールする SHALL
3. WHEN キャラクターがプラットフォームに着地する THEN 重力と衝突判定が正しく動作する SHALL
4. WHEN キャラクターがステージのゴールに到達する THEN ゴール演出が表示される SHALL

### Requirement 3: アイテムとパワーアップシステム

**User Story:** プレイヤーとして、アイテムを取得してキャラクターを強化したい

#### Acceptance Criteria

1. WHEN キャラクターがパワーアップアイテムに触れる THEN キャラクターの能力が向上する SHALL
2. WHEN キャラクターが無敵アイテムに触れる THEN 一定時間無敵状態になる SHALL
3. WHEN 無敵状態の間に敵に触れる THEN ダメージを受けない SHALL
4. WHEN 無敵時間が終了する THEN 通常状態に戻る SHALL

### Requirement 4: コインとスコアシステム

**User Story:** プレイヤーとして、コインを集めてスコアを獲得したい

#### Acceptance Criteria

1. WHEN キャラクターがコインに触れる THEN コインが取得されスコアが増加する SHALL
2. WHEN コインを取得する THEN 効果音が再生される SHALL
3. WHEN ゲーム中 THEN 現在のスコアとコイン数が画面に表示される SHALL
4. WHEN ステージをクリアする THEN 最終スコアが表示される SHALL

### Requirement 5: 音響効果

**User Story:** プレイヤーとして、ゲームアクションに対応した音響効果を聞きたい

#### Acceptance Criteria

1. WHEN キャラクターがジャンプする THEN ジャンプ効果音が再生される SHALL
2. WHEN アイテムを取得する THEN 取得効果音が再生される SHALL
3. WHEN 敵を倒す THEN 撃破効果音が再生される SHALL
4. WHEN ゴールに到達する THEN クリア効果音が再生される SHALL

### Requirement 6: ゲーム UI

**User Story:** プレイヤーとして、直感的なメニューシステムでゲームを操作したい

#### Acceptance Criteria

1. WHEN ゲームを起動する THEN スタート画面が表示される SHALL
2. WHEN スタートボタンをクリックする THEN ゲームが開始される SHALL
3. WHEN 設定ボタンをクリックする THEN 設定画面が表示される SHALL
4. WHEN 設定画面で音量を調整する THEN 効果音と BGM の音量が変更される SHALL

### Requirement 7: セーブ機能（フェーズ 2）

**User Story:** プレイヤーとして、ゲームの進行状況を保存して後で続きから遊びたい

#### Acceptance Criteria

1. WHEN ステージをクリアする THEN 進行状況がサーバーに保存される SHALL
2. WHEN ゲームを再開する THEN 前回の進行状況が読み込まれる SHALL
3. WHEN クリア済みステージがある THEN ステージ選択画面で選択可能になる SHALL
4. WHEN プレイヤーがログインする THEN 個人の進行データが取得される SHALL

### Requirement 8: 拡張機能（将来実装）

**User Story:** プレイヤーとして、多様なゲーム要素で長期間楽しみたい

#### Acceptance Criteria

1. WHEN コインを使用する THEN ショップでアイテムを購入できる SHALL
2. WHEN ゲーム中 THEN BGM が再生される SHALL
3. WHEN 異なるステージタイプ THEN 氷ステージや水上ステージなど特殊ギミックが動作する SHALL
4. WHEN 癒し系モブに触れる THEN ダメージを受けずに可愛い反応が表示される SHALL

### Requirement 9: 高度な機能（遠い将来）

**User Story:** プレイヤーとして、創造性とソーシャル要素を楽しみたい

#### Acceptance Criteria

1. WHEN ステージエディターを使用する THEN カスタムステージを作成できる SHALL
2. WHEN オンラインマルチプレイヤーモード THEN 他のプレイヤーと同時にプレイできる SHALL
3. WHEN フレンドリスト機能 THEN 友達を追加してスコアを比較できる SHALL
4. WHEN 作成したステージ THEN 他のプレイヤーと共有できる SHALL
