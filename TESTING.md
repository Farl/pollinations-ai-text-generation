# Testing Guide

## 測試流程規範

根據 `CLAUDE.md` 的規定：**不可以上傳未經測試的程式碼**

## 測試檢查清單

### 1. 本地測試（必須）

在推送到 GitHub 之前，必須完成以下測試：

#### A. 模組載入測試
```bash
# 開啟測試頁面
open http://localhost:8000/test-modules.html

# 檢查：
# ✓ 所有模組正確載入（無 404 錯誤）
# ✓ 控制台沒有 JavaScript 錯誤
# ✓ 測試結果顯示為綠色（通過）
```

#### B. 主應用測試
```bash
# 開啟主頁面
open http://localhost:8000

# 測試所有功能：
# ✓ Text Generation - 生成文字
# ✓ Vision - 上傳圖片並分析
# ✓ Speech-to-Text - 錄音並轉文字
# ✓ Text-to-Speech - 文字轉語音
# ✓ Audio Response - openai-audio 模型音頻輸出
```

#### C. 瀏覽器控制台檢查
```javascript
// 打開開發者工具（F12）
// 檢查：
// ✓ 無紅色錯誤訊息
// ✓ 無黃色警告（或確認警告可接受）
// ✓ 網路請求全部成功（200 狀態）
```

### 2. 代碼質量檢查（建議）

```bash
# 檢查語法
# 未來可添加 ESLint

# 檢查格式
# 未來可添加 Prettier

# 執行單元測試
# 未來可添加 Jest/Vitest
```

### 3. Git 提交前檢查

```bash
# 確認修改的檔案
git status

# 查看具體變更
git diff

# 確認沒有敏感資訊
grep -r "pk_" . --exclude-dir=.git --exclude="*.md"
grep -r "sk_" . --exclude-dir=.git --exclude="*.md"

# 確認 .gitignore 正確
cat .gitignore
```

### 4. 提交訊息規範

```bash
git commit -m "類型: 簡短描述

詳細說明：
- 做了什麼改動
- 為什麼要改
- 測試了什麼

測試清單：
✓ 本地功能測試
✓ 模組載入測試
✓ 控制台無錯誤

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

類型選項：
- `feat`: 新功能
- `fix`: 錯誤修復
- `refactor`: 重構代碼
- `docs`: 文檔更新
- `test`: 測試相關
- `chore`: 雜項（配置、依賴等）

## 測試場景

### 場景 1: 添加新功能
1. 開發功能
2. 本地測試（所有現有功能 + 新功能）
3. 瀏覽器控制台檢查
4. 提交並推送

### 場景 2: 修復錯誤
1. 重現錯誤
2. 修復代碼
3. 驗證修復（測試出錯場景）
4. 回歸測試（確保沒破壞其他功能）
5. 提交並推送

### 場景 3: 重構代碼
1. 記錄當前功能行為
2. 重構代碼
3. 確認所有功能行為不變
4. 性能測試（如果相關）
5. 提交並推送

### 場景 4: 更新依賴/配置
1. 備份當前工作版本
2. 更新配置
3. 完整功能測試
4. 檢查 GitHub Actions（如果影響部署）
5. 提交並推送

## 錯誤處理流程

### 如果推送後發現錯誤

1. **立即停止部署（如果可能）**
```bash
# 取消 GitHub Actions 運行
gh run cancel <run-id>
```

2. **在本地修復**
```bash
# 修復代碼
# 完整測試
git add .
git commit -m "fix: 修復 [問題描述]"
git push
```

3. **如果需要回滾**
```bash
# 回到上一個工作版本
git revert HEAD
git push

# 或重置到特定提交
git reset --hard <commit-hash>
git push --force  # 謹慎使用！
```

## 自動化測試（未來）

### 計劃添加

1. **Pre-commit Hook**
   - 自動執行測試
   - 檢查代碼格式
   - 防止提交未通過測試的代碼

2. **GitHub Actions CI**
   - 自動運行測試
   - 代碼質量檢查
   - 只在測試通過後部署

3. **E2E 測試**
   - Playwright 或 Cypress
   - 自動化用戶流程測試

## 當前狀態檢查

### 檢查已推送的代碼

```bash
# 查看最近提交
git log --oneline -5

# 查看 GitHub Actions 狀態
gh run list --limit 5

# 查看部署狀態
gh api repos/Farl/pollinations-ai-text-generation/pages
```

### 檢查線上版本

```bash
# 測試部署的網站
open https://farl.github.io/pollinations-ai-text-generation/

# 檢查：
# ✓ 網站可訪問
# ✓ 所有功能正常
# ✓ 無控制台錯誤
```

## 測試報告模板

```markdown
## 測試報告 - [日期]

### 測試項目
- [ ] 模組載入測試
- [ ] Text Generation
- [ ] Vision (圖片分析)
- [ ] Speech-to-Text
- [ ] Text-to-Speech
- [ ] Audio Response
- [ ] API 認證
- [ ] 控制台檢查

### 發現的問題
1. [描述問題]
   - 重現步驟：
   - 預期行為：
   - 實際行為：
   - 修復狀態：

### 測試環境
- 瀏覽器：Chrome/Safari/Firefox
- 作業系統：macOS/Windows/Linux
- Node 版本（如適用）：
- Python 版本：

### 結論
- [ ] 所有測試通過，可以推送
- [ ] 有問題需要修復
```

## 快速檢查命令

```bash
# 完整測試流程
./run-tests.sh  # 未來創建

# 或手動執行
python3 -m http.server 8000 &
open http://localhost:8000/test-modules.html
open http://localhost:8000
# 進行手動測試...
# 確認沒問題後推送
```

## 注意事項

⚠️ **重要規則**：
1. 絕不推送未測試的代碼
2. 修復必須經過驗證
3. 重構必須確保功能不變
4. 部署前檢查 GitHub Actions
5. 保持 CLAUDE.md 中的規則

✅ **良好實踐**：
1. 頻繁小提交優於大提交
2. 有意義的提交訊息
3. 測試覆蓋所有改動路徑
4. 記錄已知問題
5. 更新文檔
