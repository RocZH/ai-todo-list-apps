# ==============================================================================
# 🤖 2025 本地 AI Agent 自动化工作流 (Local AI Agent Automation Workflow)
# 🛠️ 风格指南：Git-Style CLI 语义契约
# ------------------------------------------------------------------------------
# 声明：此 Makefile 是为 AI Agent 设计的原子化操作接口，用于驱动 [立项-实现-同步-发布] 闭环。
# ==============================================================================

# 基础配置
MSG ?= "update: selective patch"
ISSUE_DIR := .github/issues
CURRENT_BRANCH := $(shell git rev-parse --abbrev-ref HEAD)

.PHONY: check-env add commit checkout .git-commit push push-web push-app help

# 0. 环境契约检查 (Agent 预检入口)
check-env:
	@if [ ! -f .env ]; then echo "❌ 错误: 缺失 .env 文件！Agent 必须终止操作并提示用户配置环境。"; exit 1; fi
	@command -v gh >/dev/null 2>&1 || { echo "❌ 错误: 未安装 GitHub CLI (gh)"; exit 1; }
	@command -v jq >/dev/null 2>&1 || { echo "❌ 错误: 未安装 jq"; exit 1; }

# 1. 意图立项 (类比 git add: 需求原子化)
# 流程：本地创建 #TODO 草稿 -> 编辑需求 -> 同步至云端获得物理 #ID
add: check-env
	@if [ -z "$(TITLE)" ]; then echo "❌ 语义错误: 缺少 TITLE"; exit 1; fi
	@EXISTING_FILE=$$(ls "$(ISSUE_DIR)/$(TITLE) #"[0-9]*.md 2>/dev/null | head -n 1); \
	if [ -n "$$EXISTING_FILE" ]; then \
		echo "✅ 任务已立项，无需重复创建。"; \
		echo "🔗 物理契约: file://$$(echo $$(pwd)/$$EXISTING_FILE | perl -pe 's/ /%20/g; s/#/%23/g')"; \
		exit 0; \
	fi; \
	FILE_PATH="$(ISSUE_DIR)/$(TITLE) #TODO.md"; \
	ABS_PATH="$$(pwd)/$$FILE_PATH"; \
	ENCODED_PATH=$$(echo "file://$$ABS_PATH" | perl -pe 's/ /%20/g; s/#/%23/g'); \
	if [ ! -f "$$FILE_PATH" ]; then \
		mkdir -p $(ISSUE_DIR); \
		printf "# TODO: $(TITLE)\n\n在此输入需求细节..." > "$$FILE_PATH"; \
		echo "✨ 状态：已建立本地 TODO 契约草稿"; \
		echo "🔗 编辑链接: $$ENCODED_PATH"; \
		echo "🤖 Agent 提示：请在编辑后再次运行该指令以立项至 GitHub。"; \
	else \
		CONTENT=$$(cat "$$FILE_PATH" | tr -d '[:space:]'); \
		if [ "$$CONTENT" = "#TODO:$(TITLE)在此输入需求细节..." ]; then \
			printf "❓ 内容未修改，确认要强制同步吗？(y/N) "; \
			read confirm; \
			if [ "$$confirm" != "y" ]; then echo "🚫 操作已取消。"; exit 0; fi; \
		fi; \
		echo "🚀 正在同步至 GitHub..."; \
		ISSUE_URL=$$(gh issue create --title "feat: $(TITLE)" --body-file "$$FILE_PATH" 2>/dev/null); \
		NEW_ID=$$(echo $$ISSUE_URL | grep -oE '[0-9]+$$'); \
		if [ -z "$$NEW_ID" ]; then \
			echo "❌ 错误: 无法获取 ID。请确认已运行 gh auth login"; \
			exit 1; \
		fi; \
		NEW_FILE="$(ISSUE_DIR)/$(TITLE) #$$NEW_ID.md"; \
		mv "$$FILE_PATH" "$$NEW_FILE"; \
		ENCODED_NEW_FILE=$$(echo "file://$$(pwd)/$$NEW_FILE" | perl -pe 's/ /%20/g; s/#/%23/g'); \
		echo "✅ 立项成功！ID: #$$NEW_ID"; \
		echo "🔗 归档契约: $$ENCODED_NEW_FILE"; \
	fi

# 2. 逻辑实现 (类比 git commit: AI 代理重构)
# 逻辑：驱动 AI 读取 Issue 契约执行代码修改，并自主决定后续物理交付目标
commit: check-env
	@if [ -z "$(ID)" ]; then echo "❌ 语义错误: Agent 必须提供有效的 ID。用法: make commit ID=n"; exit 1; fi
	@echo "🧠 AI Agent 正在读取 Issue #$(ID) 的物理契约并启动重构程序..."; \
	ISSUE_DATA=$$(gh issue view $(ID) --json title,body -q '.title + " - " + .body'); \
	TITLE_STR=$$(gh issue view $(ID) --json title -q '.title'); \
	iflow "任务：$$ISSUE_DATA。 \
	工程约束： \
	1. 必须物理读取 IFLOW.md 并严格遵循其中的契约协议。 \
	2. 修改完成后，必须执行物理验证(如 npx expo prebuild --clean)。 \
	3. 验证通过后，根据你的改动影响范围自主选择执行以下目标进行分发： \
	   - 全端发布: make push MSG='feat: ref #$(ID) - $$TITLE_STR' \
	   - 仅Web端: make push-web MSG='feat: ref #$(ID) - $$TITLE_STR' \
	   - 仅App端: make push-app MSG='feat: ref #$(ID) - $$TITLE_STR' \
	4. 必须跟进执行结果：若分发指令报错，须分析原因并尝试修复，直至成功获取交付产物(如 EAS 云端提供的下载链接)。"

# 3. 契约同步 (类比 git checkout: 状态一致性)
# 作用：保持本地 .github/issues/ 目录作为云端真理来源的物理镜像
checkout: check-env
	@echo "📥 正在执行物理同步：GitHub Cloud -> 本地 Agent 工作区..."; \
	mkdir -p $(ISSUE_DIR); \
	gh issue list --state open --json number,title,body --limit 20 | \
	jq -r '.[] | @base64' | \
	while read -r b64; do \
		JSON=$$(echo "$$b64" | base64 --decode); \
		FILENAME=$$(echo "$$JSON" | jq -r '.title + " #" + (.number | tostring) + ".md"'); \
		CONTENT=$$(echo "$$JSON" | jq -r '.body'); \
		printf "%s" "$$CONTENT" > "$(ISSUE_DIR)/$$FILENAME"; \
	done; \
	echo "✅ 契约同步完成。Agent 现在可以读取 $(ISSUE_DIR)/ 下的最新需求。"

# ------------------------------------------------------------------------------
# 4. 物理交付 (类比 git push: 全栈分发)
# ------------------------------------------------------------------------------

# 内部私有目标：确保项目代码已提交至本地 Git 仓库
.git-commit: check-env
	@echo "💾 正在固化本地变更到 Git 记录..."
	git add .
	@# 检查是否已有 commit，避免空提交报错；MSG 如果包含 "close #ID" 关键字，GitHub 会自动关联
	@git diff-index --quiet HEAD || git commit -m "$(MSG)"

# 全栈同步交付
push: push-web push-app
	@echo "🏆 物理分发结束：Web 与 App 已完成同步更新。"

# 仅发布到 Web (GitHub Repo + Vercel Deploy)
push-web: .git-commit
	@echo "🌐 [分发] 推送至 GitHub 并更新 Issue 记录..."
	git push
	@# 提取 MSG 中的 Issue ID (假设格式包含 #ID)，并自动追加评论
	@ISSUE_ID=$$(echo "$(MSG)" | grep -oE '#[0-9]+' | head -n 1 | sed 's/#//'); \
	if [ -n "$$ISSUE_ID" ]; then \
		gh issue comment $$ISSUE_ID --body "🚀 **Web 部署已触发**：代码已推送至 GitHub，Vercel 正在自动构建生产环境。"; \
	fi

# 仅发布到 App (EAS Update)
push-app: .git-commit
	@echo "📱 [分发] 启动 EAS Update 热更新并记录到 Issue..."
	eas update --branch $(CURRENT_BRANCH) --message "$(MSG)"
	@# 自动将热更新成功的状态反馈到 GitHub Issue
	@ISSUE_ID=$$(echo "$(MSG)" | grep -oE '#[0-9]+' | head -n 1 | sed 's/#//'); \
	if [ -n "$$ISSUE_ID" ]; then \
		gh issue comment $$ISSUE_ID --body "📱 **App 热更新已发布**：EAS Update 已推送到分支 \`$(CURRENT_BRANCH)\`。用户再次打开 App 即可生效。"; \
	fi

# 5. 帮助系统
help:
	@echo "🤖 本地 AI Agent 自动化工作流 (Git-Style):"
	@echo "  make add TITLE='xxx'  	- [意图立项] 创建/同步需求契约"
	@echo "  make commit ID=n      	- [代理实现] 驱动 AI 自动完成指定 ID 任务"
	@echo "  make checkout         	- [状态同步] 将云端最新 Issue 检出到本地工作区"
	@echo "  make push MSG='xxx'   	- [全栈分发] 同步发布 Web 与 App"
	@echo "  make push-web MSG='xxx'	- [独立分发] 仅执行 Web 部署"
	@echo "  make push-app MSG='xxx'	- [独立分发] 仅执行 App 热更新"