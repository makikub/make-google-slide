#!/bin/bash

# Google Apps Script統合ビルドスクリプト
# 各ファイルを正しい順序で結合してGASで実行可能な単一ファイルを生成

set -e

SOURCE_DIR="src"
OUTPUT_DIR="out"
OUTPUT_FILE="$OUTPUT_DIR/google-slides-generator.gs"

echo "🔨 Google Apps Script統合ビルド開始..."

# 出力ディレクトリ作成
mkdir -p "$OUTPUT_DIR"

# 出力ファイル初期化
cat > "$OUTPUT_FILE" << 'EOF'
/**
 * @OnlyCurrentDoc
 * このスクリプトは、Google風デザインテンプレートに基づきGoogleスライドを自動生成します。
 * Version: 12.0 (Universal Google Design - Final)
 * Author: Googleスライド自動生成マスター
 * Prompt Design: まじん式プロンプト
 * Description: 指定されたslideData配列を元に、Google風デザインに準拠したスライドを生成します。
 * 
 * 🏗️  このファイルは build.sh により自動生成されました
 * 📁  編集は src/ ディレクトリ内の個別ファイルで行ってください
 */

EOF

echo "📝 ファイル結合中..."

# 1. 実行設定
echo "   ✅ first.gs (実行設定)"
echo "// === 1. 実行設定 ===" >> "$OUTPUT_FILE"
cat "$SOURCE_DIR/first.gs" >> "$OUTPUT_FILE"
echo -e "\n" >> "$OUTPUT_FILE"

# 2. デザイン設定  
echo "   ✅ style.gs (デザイン設定)"
echo "// === 2. デザイン設定 ===" >> "$OUTPUT_FILE"
cat "$SOURCE_DIR/style.gs" >> "$OUTPUT_FILE"
echo -e "\n" >> "$OUTPUT_FILE"

# 3. テーマ抽象化API
echo "   ✅ theme.gs (テーマAPI)"
echo "// === 3. テーマ抽象化API ===" >> "$OUTPUT_FILE"
cat "$SOURCE_DIR/theme.gs" >> "$OUTPUT_FILE"
echo -e "\n" >> "$OUTPUT_FILE"

# 4. スライドデータ
echo "   ✅ text-data.gs (サンプルデータ)"
echo "// === 4. スライドデータ ===" >> "$OUTPUT_FILE"
cat "$SOURCE_DIR/text-data.gs" >> "$OUTPUT_FILE"
echo -e "\n" >> "$OUTPUT_FILE"

# 5. メイン実行ロジック
echo "   ✅ slide.gs (スライド生成ロジック)"
echo "// === 5. スライド生成ロジック ===" >> "$OUTPUT_FILE"
cat "$SOURCE_DIR/slide.gs" >> "$OUTPUT_FILE"

echo ""
echo "✨ ビルド完了!"
echo "📄 出力ファイル: $OUTPUT_FILE"
echo "📏 ファイルサイズ: $(wc -c < "$OUTPUT_FILE" | tr -d ' ') bytes"
echo "📊 行数: $(wc -l < "$OUTPUT_FILE" | tr -d ' ') lines"
echo ""
echo "🚀 使用方法:"
echo "   1. $OUTPUT_FILE の内容をコピー"
echo "   2. Google Apps Script エディタに貼り付け"
echo "   3. generatePresentation() 関数を実行"
echo ""
echo "🔧 開発時は src/ ディレクトリ内のファイルを編集してください"