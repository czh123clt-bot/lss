import { Handler } from '@netlify/functions';
import axios from 'axios';
import * as chineseConv from 'chinese-conv';

function toSimplified(text: string): string {
  if (!text) return "";
  try {
    return (chineseConv as any).t2s(text);
  } catch (e) {
    return text;
  }
}

export const handler: Handler = async (event, context) => {
  // Only allow POST requests for our API endpoints
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method Not Allowed' }),
      headers: {
        'Content-Type': 'application/json',
      },
    };
  }

  const path = event.path;
  const isHistory = path.endsWith('/history');
  const isExplain = path.endsWith('/explain');

  if (!isHistory && !isExplain) {
    return {
      statusCode: 404,
      body: JSON.stringify({ error: 'Endpoint Not Found' }),
      headers: {
        'Content-Type': 'application/json',
      },
    };
  }

  let body: any = {};
  try {
    body = JSON.parse(event.body || '{}');
  } catch (err) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Invalid JSON body' }),
      headers: {
        'Content-Type': 'application/json',
      },
    };
  }

  const deepseekApiKey = process.env.DEEPSEEK_API_KEY;
  if (!deepseekApiKey) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        error: '未在 Netlify 环境变量中检测到 DEEPSEEK_API_KEY。请登录 Netlify 控制台并在 Site settings -> Environment variables 中添加此 Key。'
      }),
      headers: {
        'Content-Type': 'application/json',
      },
    };
  }

  let baseUrl = process.env.DEEPSEEK_API_BASE_URL || 'https://api.deepseek.com/v1';
  baseUrl = baseUrl.replace(/\/$/, "");
  const endpoint = baseUrl.endsWith('/chat/completions') ? baseUrl : `${baseUrl}/chat/completions`;

  // --- HANDLE HISTORY ENDPOINT ---
  if (isHistory) {
    const { year, month, day } = body;
    if (!month || !day) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Month and Day are required' }),
        headers: {
          'Content-Type': 'application/json',
        },
      };
    }

    const inputYear = year ? parseInt(year) : new Date().getFullYear();

    const prompt = `你是一个专业的历史学家。用户输入的特定日子是：${inputYear}年${month}月${day}日。
      
请帮我找出 5 个真实的、具有重大意义的历史瞬间。
请遵循以下严格规则：
1. 【首选精准匹配】：你必须极其努力地优先寻找在【${inputYear}年${month}月${day}日这一天当天】发生的任何重大历史事件、协议签署、政治事件，或者在这一天出生、逝世的杰出名人。
2. 【严格结构布局】：你返回的 5 个元素中：
   - 前 2 个元素（索引 0 和 1）必须是这一天出生的杰出名人的生日（名人生日）。
   - 后 3 个元素（索引 2, 3 和 4）必须是这一天发生的重大历史事件（历史瞬间/历史事件）。
3. 【极简一句话标题】：每个事件请压缩成一句话作为标题（不带任何描述，无换行），不要带有除了年份以外的前缀，格式如：
   “1998年：中华人民共和国与南非共和国正式建立外交关系”
   “1986年：著名音乐家[姓名]诞生”
4. 【深度细节描述（重要）】：对每个事件，生成 2 段（每段约 50-80 字，合起来共 100-150 字左右）简洁而深入的背景与意义解读，存入 "description" 字段。使用 "\\n\\n" 来分隔段落。
5. 【简体中文】：所有返回的内容必须完全是简体中文。
6. 【保证真实性】：请务必返回真实、有据可查的历史。

请直接返回一个标准的 JSON 数组格式，没有任何 Markdown 代码块标记（不要用 \`\`\`json 开头，不要用 \`\`\` 结尾），没有其他前后解释文字。结构必须如下：
[
  { 
    "year": 1998, 
    "title": "1998年：中华人民共和国与南非共和国正式建立外交关系", 
    "description": "第一段背景解读...\\n\\n第二段历史意义及深远影响..."
  }
]`;

    try {
      const dsResponse = await axios.post(endpoint, {
        model: "deepseek-chat",
        messages: [
          { role: "system", content: "You are a professional historian that outputs strictly JSON arrays with detailed event descriptions." },
          { role: "user", content: prompt }
        ],
        temperature: 0.3
      }, {
        headers: {
          'Authorization': `Bearer ${deepseekApiKey}`,
          'Content-Type': 'application/json'
        },
        timeout: 55000
      });

      const text = dsResponse.data?.choices?.[0]?.message?.content?.trim() || "";
      const cleanJson = text.replace(/^```(json)?\s*/i, '').replace(/```$/, '').trim();
      const parsed = JSON.parse(cleanJson);
      
      if (Array.isArray(parsed) && parsed.length === 5) {
        const validEvents = parsed.filter(item => {
          const itemYear = parseInt(item.year);
          return !isNaN(itemYear) && itemYear <= inputYear;
        }).map(item => ({
          year: parseInt(item.year),
          title: toSimplified(item.title),
          description: toSimplified(item.description || "")
        }));

        if (validEvents.length === 5) {
          return {
            statusCode: 200,
            body: JSON.stringify(validEvents),
            headers: { 'Content-Type': 'application/json' },
          };
        }
      }
      throw new Error("格式解析不匹配，请重新尝试。");
    } catch (dsError: any) {
      console.warn("DeepSeek query failed in serverless function:", dsError.response?.data || dsError.message);
      const errorMsg = dsError.response?.data?.error?.message || dsError.message || "未知原因";
      return {
        statusCode: 500,
        body: JSON.stringify({ error: `DeepSeek 调用失败: ${errorMsg}` }),
        headers: { 'Content-Type': 'application/json' },
      };
    }
  }

  // --- HANDLE EXPLAIN ENDPOINT ---
  if (isExplain) {
    const { year, month, day, title } = body;
    if (!title) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Title is required' }),
        headers: { 'Content-Type': 'application/json' },
      };
    }

    const prompt = `你是一位杰出的历史学家。请针对以下历史事件提供深度、专业且引人入胜的背景解读与历史意义：
事件：“${title}”（发生于：${year || ""}年${month || ""}月${day || ""}日或相近时期）

请提供 3 段内容：
1. 【历史背景】：简要解释该事件是如何发生的、当时的时代背景是什么。
2. 【核心细节】：生动描述事件的关键瞬间或核心人物的贡献。
3. 【深远影响】：阐述该事件对后世及现代世界的长远影响。

请以简体中文书写，字数在 250 到 350 字之间。排版精美，使用换行分割段落。`;

    try {
      const dsResponse = await axios.post(endpoint, {
        model: "deepseek-chat",
        messages: [
          { role: "system", content: "你是一位专业且文笔流畅的历史学家。请直接用精美的简体中文段落回答，不要使用任何 Markdown 代码块包裹，也不要说多余的解释，直接输出正文。" },
          { role: "user", content: prompt }
        ],
        temperature: 0.6
      }, {
        headers: {
          'Authorization': `Bearer ${deepseekApiKey}`,
          'Content-Type': 'application/json'
        },
        timeout: 15000
      });

      const explanation = dsResponse.data?.choices?.[0]?.message?.content?.trim();
      if (explanation) {
        return {
          statusCode: 200,
          body: JSON.stringify({ explanation: toSimplified(explanation) }),
          headers: { 'Content-Type': 'application/json' },
        };
      }
      throw new Error("生成的内容为空");
    } catch (dsError: any) {
      console.warn("DeepSeek explain failed in serverless function:", dsError.response?.data || dsError.message);
      const errorMsg = dsError.response?.data?.error?.message || dsError.message || "未知原因";
      return {
        statusCode: 500,
        body: JSON.stringify({ error: `DeepSeek 解析失败: ${errorMsg}` }),
        headers: { 'Content-Type': 'application/json' },
      };
    }
  }

  return {
    statusCode: 404,
    body: JSON.stringify({ error: 'Not Found' }),
    headers: { 'Content-Type': 'application/json' },
  };
};
