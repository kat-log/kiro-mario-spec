# Requirements Document

## Introduction

マリオスタイルプラットフォーマーゲームにおいて、スペースキーによるジャンプ機能が正常に動作しない問題を解決します。調査の結果、以下の具体的な問題が特定されました：

1. **キー入力は正常に検出されている** - "keys: space actions: jump" と表示される
2. **プレイヤーの地面判定に問題がある** - `isOnGround` 状態が正しく設定されていない
3. **物理エンジンの更新順序に問題がある** - 地面判定がジャンプ実行前にリセットされている
4. **ジャンプ実行条件の検証が厳しすぎる** - 地面にいてもジャンプできない状況が発生

この問題により、ゲームの基本的な操作性が完全に損なわれているため、緊急に修正が必要です。

## Requirements

### Requirement 1: プレイヤーの地面判定システムの修正

**User Story:** プレイヤーとして、地面に立っているときに確実にジャンプできることを期待する

#### Acceptance Criteria

1. WHEN プレイヤーが地面に接触している THEN `isOnGround` 状態が `true` に設定される SHALL
2. WHEN プレイヤーが地面から離れる THEN `isOnGround` 状態が `false` に設定される SHALL
3. WHEN 物理エンジンが更新される THEN 地面判定が適切なタイミングで実行される SHALL
4. WHEN 地面判定が変更される THEN 変更内容がデバッグログに記録される SHALL

### Requirement 2: ジャンプ実行ロジックの修正

**User Story:** プレイヤーとして、スペースキーを押したときにキャラクターが確実にジャンプすることを期待する

#### Acceptance Criteria

1. WHEN スペースキー入力が検出される AND プレイヤーが地面にいる THEN ジャンプが確実に実行される SHALL
2. WHEN ジャンプが実行される THEN プレイヤーの垂直速度が負の値（上向き）に設定される SHALL
3. WHEN ジャンプが実行される THEN プレイヤーの `isOnGround` 状態が `false` に設定される SHALL
4. WHEN ジャンプが実行される THEN プレイヤーの状態が "jumping" に変更される SHALL

### Requirement 3: 物理エンジンの更新順序の最適化

**User Story:** 開発者として、物理エンジンの更新が正しい順序で実行されることを確認したい

#### Acceptance Criteria

1. WHEN 物理エンジンが更新される THEN 地面判定がプレイヤー入力処理の後に実行される SHALL
2. WHEN 衝突検出が実行される THEN 地面との衝突が正確に検出される SHALL
3. WHEN 地面衝突が解決される THEN プレイヤーの位置と速度が適切に調整される SHALL
4. WHEN 物理更新が完了する THEN 地面判定状態が次フレームまで保持される SHALL

### Requirement 4: ジャンプ条件検証の改善

**User Story:** プレイヤーとして、地面にいるときは常にジャンプできることを期待する

#### Acceptance Criteria

1. WHEN プレイヤーが地面にいる THEN ジャンプ条件検証が成功する SHALL
2. WHEN ジャンプ条件が満たされない THEN 具体的な理由がログに記録される SHALL
3. WHEN 地面判定が曖昧な状況 THEN より寛容な判定ロジックが適用される SHALL
4. WHEN ジャンプが失敗する THEN 失敗理由と現在の状態が詳細に報告される SHALL

### Requirement 5: デバッグとテスト機能の強化

**User Story:** 開発者として、ジャンプ機能の問題を迅速に診断・修正できる機能が必要

#### Acceptance Criteria

1. WHEN デバッグモードが有効 THEN プレイヤーの状態とジャンプ条件がリアルタイムで表示される SHALL
2. WHEN ジャンプが試行される THEN 入力から実行までの全段階がログに記録される SHALL
3. WHEN テスト機能が実行される THEN ジャンプ機能の動作状況が自動的に検証される SHALL
4. WHEN 問題が検出される THEN 具体的な修正提案が提示される SHALL

### Requirement 6: 代替入力手段の確実な動作

**User Story:** プレイヤーとして、スペースキー以外のキーでも確実にジャンプできることを期待する

#### Acceptance Criteria

1. WHEN 上矢印キーが押される THEN スペースキーと同様にジャンプが実行される SHALL
2. WHEN W キーが押される THEN スペースキーと同様にジャンプが実行される SHALL
3. WHEN Enter キーが押される THEN スペースキーと同様にジャンプが実行される SHALL
4. WHEN 複数のジャンプキーが同時に押される THEN 重複実行が防止される SHALL
