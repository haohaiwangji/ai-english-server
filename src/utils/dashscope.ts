import OpenAI from "openai";
import { config } from '@/config';

const openai = new OpenAI({
  apiKey: config.DASHSCOPE_API_KEY,
  baseURL: "https://dashscope.aliyuncs.com/compatible-mode/v1"
});

export async function analyzeImage(imageBase64: string) {
  try {
    const response = await openai.chat.completions.create({
      model: "qwen-vl-max",
      messages: [{
        role: "user",
        content: [
          {
            type: "image_url",
            image_url: {
              url: `data:image/jpeg;base64,${imageBase64}`
            }
          },
          {
            type: "text",
            text: `请以自然流畅的方式分析这张图片：

1. 首先列出图中所有可见的物体、人物、动物、场景元素等，包括背景中的内容。每个词都必须包含英文和中文对照。
2. 然后描述这个场景给我听，就像你在向朋友描述一个地方或一个时刻。避免使用"图片展示了"、"这是一张"等机械化的表达。直接描述场景本身，突出氛围和感受。
3. 如果图片中没有明显的具体物体，从场景的氛围、光线、色彩等方面提取关键词。
4. 确保至少输出3个以上的词汇。

请按照以下格式输出：

物体：
1. tree (树)
2. sky (天空)
3. person (人)
...（尽可能多地列出）

场景描述：
EN: [直接描述场景，如：Golden sunlight streams through the ancient forest canopy, creating a magical atmosphere of peace and tranquility...]
ZH: [对应的中文描述，如：金色的阳光透过古老的林冠洒落下来，营造出一种宁静祥和的魔幻氛围...]

注意：
- 词汇列表必须非空
- 场景描述要自然流畅，避免机械化的表达
- 确保英文单词准确对应中文含义
- 描述要有画面感和情感共鸣`
          }
        ]
      }]
    });

    const text = response.choices[0].message.content || '';
    const result = parseResponse(text);

    // 如果解析结果中词汇为空，从场景描述中提取关键词
    if (result.words.length === 0 && result.description.en) {
      const extractedWords = extractWordsFromDescription(result.description.en);
      result.words = extractedWords;
    }

    // 如果仍然为空，添加默认词汇
    if (result.words.length === 0) {
      result.words = [
        { en: "scene", zh: "场景" },
        { en: "image", zh: "图片" },
        { en: "view", zh: "视图" }
      ];
    }

    return result;
  } catch (error) {
    console.error('Error calling Qwen API:', error);
    throw error;
  }
}

function parseResponse(text: string): { words: Array<{en: string, zh: string}>, description: {en: string, zh: string} } {
  const words: Array<{en: string, zh: string}> = [];
  let description = { en: '', zh: '' };

  try {
    // 解析返回的文本
    const sections = text.split('\n\n');
    
    // 解析物体列表
    const objectsSection = sections[0].split('\n').slice(1);
    objectsSection.forEach(line => {
      // 改进正则表达式以匹配更多格式
      const match = line.match(/\d+\.\s+([a-zA-Z\s]+)\s*\(([^)]+)\)/);
      if (match) {
        words.push({
          en: match[1].trim(),
          zh: match[2].trim(),
        });
      }
    });

    // 解析场景描述
    const descriptionSection = sections[1].split('\n').slice(1);
    descriptionSection.forEach(line => {
      if (line.startsWith('EN:')) {
        description.en = line.replace('EN:', '').trim();
      } else if (line.startsWith('ZH:')) {
        description.zh = line.replace('ZH:', '').trim();
      }
    });
  } catch (error) {
    console.error('Error parsing response:', error);
    return {
      words: [{ en: "scene", zh: "场景" }],
      description: {
        en: "Image analysis result",
        zh: "图片分析结果"
      }
    };
  }

  return { words, description };
}

// 从场景描述中提取关键词
function extractWordsFromDescription(description: string): Array<{en: string, zh: string}> {
  const commonWords = new Set(['a', 'an', 'the', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'and']);
  const words = description
    .toLowerCase()
    .replace(/[.,!?]/g, '')
    .split(' ')
    .filter(word => word.length > 2 && !commonWords.has(word))
    .slice(0, 5);  // 取前5个有意义的词

  // 为提取的词添加基本中文翻译
  const translations: Record<string, string> = {
    beautiful: "美丽的",
    sunny: "阳光的",
    outdoor: "户外的",
    indoor: "室内的",
    large: "大的",
    small: "小的",
    bright: "明亮的",
    dark: "黑暗的",
    modern: "现代的",
    natural: "自然的",
    // 可以继续添加更多常用词的翻译
  };

  return words.map(word => ({
    en: word,
    zh: translations[word] || "未知"
  }));
}
