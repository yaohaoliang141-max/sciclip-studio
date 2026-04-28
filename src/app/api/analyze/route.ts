import { NextRequest, NextResponse } from 'next/server';
import { ScriptSegment } from '@/types';

const QWEN_BASE_URL = 'https://dashscope.aliyuncs.com/compatible-mode/v1';
const QWEN_MODEL = 'qwen-plus'; // 可换 qwen-turbo / qwen-max

export async function POST(req: NextRequest) {
  try {
    const { script } = await req.json();

    if (!script?.trim()) {
      return NextResponse.json({ error: '请输入口稿内容' }, { status: 400 });
    }

    const prompt = `你是一个科普视频制作专家。请将以下科普口稿拆分为若干逻辑片段（4-8个），并为每个片段生成一个精准的英文视频搜索关键词（2-4个单词），用于在 Pexels 搜索相关视觉素材。

口稿内容：
${script}

请以 JSON 数组格式返回，严格按照以下结构，不要有任何额外说明：
[
  {
    "id": "seg_1",
    "text": "片段文本内容",
    "keyword": "english search keyword"
  }
]

要求：
1. 片段划分要自然，保持语义完整
2. 英文关键词要具体、视觉化，适合搜索 B-Roll 素材
3. 关键词避免过于抽象，应该是可以拍摄出来的场景
4. 直接返回 JSON 数组，不要 markdown 代码块`;

    const response = await fetch(`${QWEN_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.QWEN_API_KEY}`,
      },
      body: JSON.stringify({
        model: QWEN_MODEL,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3,
        response_format: { type: 'text' },
      }),
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error?.message || `千问 API 错误: ${response.status}`);
    }

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content?.trim() ?? '';

    // 清理可能的 markdown 代码块
    const cleaned = text
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/i, '')
      .replace(/\s*```$/i, '');

    let segments: ScriptSegment[];
    try {
      segments = JSON.parse(cleaned);
    } catch {
      const match = cleaned.match(/\[[\s\S]*\]/);
      if (!match) throw new Error('AI 返回格式无效');
      segments = JSON.parse(match[0]);
    }

    return NextResponse.json({ segments });
  } catch (error: any) {
    console.error('Analyze Error:', error);
    return NextResponse.json({ error: error.message || '分析失败' }, { status: 500 });
  }
}
