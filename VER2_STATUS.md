# EDF 記念撮影 Ver2 — プロジェクト状況

最終更新: 2026-06-03（Ver2を本番デプロイ済み）

## 現在の目的

TGS2026ブース向け「プリクラ風 顔はめ記念撮影アプリ」のVer2。
クイズ → プリクラ風フレーム選択 → 蟻襲撃演出 → 顔はめ撮影 → QR保存。

- **URL（本番）:** https://edf-face-photo.onrender.com  ← Ver2デプロイ済み
- **GitHub:** https://github.com/gas-ichimori/edf-face-photo.git
- **ローカル:** /Users/ichimori/Desktop/AI-D3P-EVENT 2/edf-face-photo/
- **ローカル起動:** `node server.js` → http://localhost:3005

## 体験フロー（Ver2）

1. **①スタート画面** — プリクラ風・白背景。**全アートをプリロードしてからボタン有効化**（読み込み中はボタン灰色＋「読み込み中...」表示）。ロゴローテーション／「ようこそ！EDF！」／「記念撮影」／点滅ヒント（▼ボタンを押せ▼ / ▲PRESS THE BUTTON▲はボタン下）／著作権
2. **②クイズ** — 「EDFの意味は？」 1.Earth Doesn't Fall(誤) 2.Every Day Fighters(誤) 3.Earth Defense Force(正)
3. **③判定画面** — 背景top_bg.png＋暗幕
   - 正解: ○「正解だ！」「さすがEDFの精鋭だ！…さあ、記念撮影だ！」→ フレーム選択可
   - 不正解: ×「FAILED」「残念だったな、新兵。…せめて記念撮影でもしていけ。」→ フレーム選択不可
4. **④フレーム選択** — 3×3グリッド（frame_00〜08.png）。赤い選択枠は非表示。不正解時は選択不可で約1.8秒後に自動で蟻襲撃へ
5. **⑤蟻侵入** — フレーム選択画面の上にz-index:800オーバーレイ。12匹（左6右6）がスプライト歩行で3秒間「通り抜け」続ける（中央で止まらない）
6. **⑥正面蟻突進** — 3秒後、ant_front1→2→3→4を1回順再生→最終コマでスケールアップ。**横歩き蟻は消さず歩行継続**→ブラックアウト
7. **⑦撮影** — 顔はめパネルの穴にカメラ映像をリアルタイム合成。3・2・1・📸
8. **⑧処理中** → **⑨結果** — 合成画像＋QR（24h有効）。最終画面のフレーム合成は無効化中

## 顔はめ楕円（OVAL）現在値

```js
const OVAL = { cx: 0.48, cy: 0.39, rx: 0.083, ry: 0.060, rot: 10 };
```
- cx=横位置(0.5中央)、cy=縦位置(小さい=上)、rx=横半径、ry=縦半径、rot=傾き度(正で右)
- drawFaceInOvalで ctx.translate→rotate→ellipse で傾き適用
- getCenterCrop: Math.min(vw,vh)*0.9、yOffset vh*0.05（PCウェブカム調整）

## 実装済み機能

- ①〜⑨全画面遷移、クイズ正解/不正解分岐
- 全アートのプリロード→ボタン有効化（preloadAssets）
- フレーム選択（PNG優先・object-fit:contain・セル比率355/567で歪み解消）
- buildFrameGrid(disabled)で不正解時の選択不可を確実化（await対応済み）
- 蟻スプライト歩行（ant1〜4.png、頭左向き＝右進行時scaleX(-1)反転）
- 蟻12匹が通り抜け継続、消えない（overlay.isConnectedでループ停止）
- 正面蟻1回再生→スケールアップ→ブラックアウト
- カメラのリアルタイム顔合成、QR保存

## 未実装・調整中

- **最終画面のフレーム合成は無効化中**（compositeImage内コメントアウト）。フレームPNGがパネル(480×852)と比率不一致のため。理想は **430×860px** で9枚再生成→合成処理を戻す
- 正面蟻4枚のスタイル（リアル系茶褐色が理想だが現状サイバー寄り。気になれば再生成）
- 顔楕円の最終微調整（本番カメラ固定後）

## 重要な設計判断

- 蟻演出はフレーム選択画面の上にオーバーレイ（白画面に切替えない）
- フレームはPNG画像方式（Canvas描画では質感不足）
- 正面蟻はループせず1回再生（カクつき対策）
- 蟻は消さず歩き続ける（賑やかさ維持）
- スタート前に全アートプリロード（本番で画像が出ない事故を防ぐ）

## 次にやるべきこと

1. （任意）フレームPNG9枚を430×860pxで再生成 → compositeImageのフレーム合成を復活
2. （任意）正面蟻4枚をリアル系で再生成
3. 本番カメラ環境で顔楕円OVALを最終確定
4. ブース実機テスト

## 関連ファイル

| ファイル | 役割 |
|---------|------|
| public/index.html | 全ロジック（単一ファイル） |
| server.js | Express。/save-image, /photo/:id, /ping, 24h cleanup |
| public/image_edf_face_panel.png | 顔はめ背景パネル（480×852、穴あり） |
| public/frame_00〜08.png | 9種フレーム（要再生成: 430×860推奨） |
| public/ant1〜4.png | 横歩き蟻スプライト（頭は左向き） |
| public/ant_front1〜4.png | 正面突進蟻スプライト |
| public/ant_front.png | 旧・正面蟻静止画（フォールバック用） |
| public/logo1〜3.png, mark.png, top_bg.png | edf-trainingから流用 |

## デプロイ手順

ローカル編集 → `git add public/index.html` → `git commit` → `git push origin main` → Render自動デプロイ（1〜2分）。
カメラはHTTPS(本番URL)でのみ起動。スマホQRテストは本番URLで。

## 注意: 「API Error: Usage credits required for 1M context」

アプリのエラーではなく、Claudeの1Mコンテキスト利用にクレジットが必要という通知。会話が長いと表示。コードへの影響なし。
