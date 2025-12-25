# 确保安装了 openai 库 (pip install openai)，它与 DeepSeek API 完全兼容。
import os, sys, json, re
from openai import OpenAI, APIStatusError


def parse():
    # 1. 检查环境变量
    api_key = os.getenv("DEEPSEEK_API_KEY")
    if not api_key:
        return {"status": "failed", "summary": "缺失环境变量 DEEPSEEK_API_KEY", "url": ""}

    try:
        client = OpenAI(
            api_key=api_key, 
            base_url="https://api.deepseek.com",
            timeout=30.0
        )
        
        # 2. 读取输入并清洗 ANSI 颜色代码 (防止干扰 AI 识别文本)
        raw_input = sys.stdin.read()
        if not raw_input.strip():
            return {"status": "failed", "summary": "AI 输出内容为空，无法分析交付状态", "url": ""}
        
        # 清除终端颜色字符 (如 \033[32m)
        clean_input = re.compile(r'\x1B(?:[@-Z\\-_]|\[[0-?]*[ -/]*[@-~])').sub('', raw_input)
        
        # 3. 构造严谨的 Prompt
        schema_instruction = (
            "你是一个严格的交付结果提取专家。\n"
            "任务：从提供的日志中提取任务执行的 status, summary 和 url。\n"
            "约束：\n"
            "1. 必须基于事实：如果日志中没有提到交付 URL 或预览链接，则 url 字段必须返回空字符串 \"\"，严禁自行伪造或脑补链接。\n"
            "2. 状态判定：只有看到明确的 'success'、'passed'、'deployed' 或分发指令执行成功且无后续报错时，status 才为 'success'。\n"
            "3. 摘要要求：summary 必须是日志中真实发生的行为简述。\n"
            "4. 格式：返回标准 JSON，不要包含任何额外解释。"
        )
        
        resp = client.chat.completions.create(
            model="deepseek-chat", 
            messages=[
                {"role": "system", "content": schema_instruction},
                {"role": "user", "content": clean_input}
            ],
            response_format={'type': 'json_object'}
        )
        
        # 核心修正：SDK 1.0+ 必须访问 choices[0]
        return resp.choices[0].message.content

    except APIStatusError as e:
        msg = "DeepSeek 余额不足" if e.status_code == 402 else f"API 状态异常: {e.status_code}"
        return json.dumps({"status": "failed", "summary": msg, "url": ""})
    except Exception as e:
        return json.dumps({"status": "failed", "summary": f"解析器异常: {str(e)}", "url": ""})


if __name__ == "__main__":
    result = parse()
    # 确保输出到 stdout 的内容始终是可解析的 JSON 字符串
    if isinstance(result, str):
        try:
            # 验证一次是否为合法 JSON，防止模型返回非 JSON 字符
            json.loads(result)
            print(result)
        except:
            print(json.dumps({"status": "failed", "summary": "模型返回了非法格式", "url": ""}))
    else:
        print(json.dumps(result))