# Google Slides Auto Generator

モジュラー設計によるGoogle Apps Script (GAS) スライド自動生成システム

## 概要

`before-prompt.md`の1000行以上の巨大なプロンプトファイルを、メンテナブルで個別カスタマイズ可能なモジュラー構成に正規化したプロジェクトです。

## ディレクトリ構成

```
src/
├── first.gs        # 実行設定（スライドクリア、対象プレゼンテーション）
├── style.gs        # デザイン設定（COLOR、FONTS、レイアウト）
├── theme.gs        # テーマ抽象化API（スタイルとロジックの分離）
├── text-data.gs    # スライドデータ（カスタマイズ対象）
└── slide.gs        # スライド生成ロジック
build.sh            # GAS統合ビルドスクリプト
```

## 主な特徴

- **完全な責任分離**: `style.gs`の変更時に`slide.gs`修正不要
- **Theme API**: セマンティックなカラー・フォント管理
- **ワンクリックビルド**: `build.sh`でGAS用単一ファイル生成
- **モジュラー設計**: 個別ファイルでの部分カスタマイズ対応

## 使用方法

### 1. ビルド

```bash
./build.sh
```

### 2. GASデプロイ

1. `google-slides-generator.gs`の内容をコピー
2. Google Apps Script エディタに貼り付け
3. `generatePresentation()`関数を実行

### 3. カスタマイズ

- **スライド内容**: `src/text-data.gs`を編集
- **デザイン**: `src/style.gs`の`CONFIG`オブジェクトを変更
- **設定**: `src/first.gs`で実行オプション調整

## アーキテクチャ

```
slide.gs → Theme API → style.gs
                    ↘ CONFIG
```

`slide.gs`は`Theme.getColor()`, `Theme.getFontSize()`等のセマンティックAPIを使用し、`CONFIG`に直接依存しません。

## 生成ファイル

- **サイズ**: 43,927 bytes
- **行数**: 987 lines
- **対応スライドタイプ**: title, section, cards, table, timeline, diagram, process, progress, closing

## 開発時の注意

- `src/`ディレクトリ内のファイルを編集
- ビルド後の`google-slides-generator.gs`は自動生成のため直接編集禁止