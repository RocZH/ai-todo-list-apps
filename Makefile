# 消息及其默认值定义
MSG ?= "update: selective patch"

.PHONY: check-env web app patch help

# 0. 检查关键环境变量是否存在
check-env:
	@if [ ! -f .env ]; then echo "❌ 错误: 缺失 .env 文件，发布可能导致 App 无法连接数据库！"; exit 1; fi

# 1. 仅发布到 Web (Vercel Deploy)
web: check-env
	@echo "🌐 正在检查变更并推送 GitHub 和 Web 自动部署..."
	git add .
	@git diff-index --quiet HEAD || git commit -m "$(MSG)"
	git push

# 2. 仅发布到 App (EAS Update)
app: check-env
	@echo "📱 正在执行 EAS Update (App 热更新)..."
	eas update --branch $(shell git rev-parse --abbrev-ref HEAD) --message "$(MSG)"

# 3. 全栈多端一键发布 (组合目标 web 和 app)
patch: web app
	@echo "✅ 全栈多端同步发布完成。"

# 获取帮助信息
help:
	@echo "可用指令:"
	@echo "  make web MSG='xxx'   - 仅更新 Web"
	@echo "  make app MSG='xxx'   - 仅更新 App"
	@echo "  make patch MSG='xxx' - 全栈多端同步更新"
	@echo "  make web MSG='yyy' && make app MSG='zzz' - 全栈多端同步更新，Web 版本更新内容为 'yyy'，App 版本更新内容为 'zzz'"