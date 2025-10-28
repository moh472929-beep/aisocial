import axios from "axios";
import config from "../../config.js";

class OpenAIService {
  constructor() {
    this.apiKey = config.ai.openaiApiKey;
    this.baseURL = 'https://api.openai.com/v1';
  }

  async chat(messages, options = {}) {
    // إذا لم يكن هناك مفتاح API، نعيد رد تجريبي
    if (!this.apiKey || this.apiKey === 'sk-test-demo-key-for-development') {
      return this.getMockResponse(messages);
    }

    try {
      const response = await axios.post(
        `${this.baseURL}/chat/completions`,
        {
          model: options.model || 'gpt-3.5-turbo',
          messages: messages,
          max_tokens: options.maxTokens || config.ai.maxTokens,
          temperature: options.temperature || config.ai.temperature,
        },
        {
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      return response.data.choices[0].message.content;
    } catch (error) {
      console.error('OpenAI API Error:', error.response?.data || error.message);
      
      // في حالة الخطأ، نعيد رد تجريبي
      return this.getMockResponse(messages);
    }
  }

  async generateImage(prompt, options = {}) {
    // إذا لم يكن هناك مفتاح API، نعيد صورة تجريبية
    if (!this.apiKey || this.apiKey === 'sk-test-demo-key-for-development') {
      return this.getMockImageResponse(prompt);
    }

    try {
      const response = await axios.post(
        `${this.baseURL}/images/generations`,
        {
          prompt: prompt,
          n: 1,
          size: options.size || '512x512',
        },
        {
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      return response.data.data[0].url;
    } catch (error) {
      console.error('OpenAI Image Generation Error:', error.response?.data || error.message);
      
      // في حالة الخطأ، نعيد صورة تجريبية
      return this.getMockImageResponse(prompt);
    }
  }

  getMockResponse(messages) {
    const userMessage = messages[messages.length - 1]?.content || '';
    
    // ردود تجريبية ذكية بناءً على محتوى الرسالة
    if (userMessage.includes('مرحبا') || userMessage.includes('hello')) {
      return 'مرحباً! أنا مساعدك الذكي لإدارة صفحات الفيسبوك. كيف يمكنني مساعدتك اليوم؟';
    }
    
    if (userMessage.includes('منشور') || userMessage.includes('post')) {
      return 'يمكنني مساعدتك في إنشاء منشورات جذابة لصفحتك على الفيسبوك. ما هو الموضوع الذي تريد الكتابة عنه؟';
    }
    
    if (userMessage.includes('تحليل') || userMessage.includes('analytics')) {
      return 'سأساعدك في تحليل أداء صفحتك. يمكنني تقديم إحصائيات حول المشاركات والتفاعل ونمو المتابعين.';
    }
    
    // رد افتراضي
    return 'شكراً لك على رسالتك. أنا هنا لمساعدتك في إدارة صفحات الفيسبوك وإنشاء المحتوى. هذا رد تجريبي حيث أن مفتاح OpenAI API غير متوفر حالياً.';
  }

  getMockImageResponse(prompt) {
    // إرجاع رابط صورة تجريبية من Unsplash
    const encodedPrompt = encodeURIComponent(prompt);
    return `https://source.unsplash.com/512x512/?${encodedPrompt}`;
  }

  isConfigured() {
    return this.apiKey && this.apiKey !== 'sk-test-demo-key-for-development';
  }
}

const openaiService = new OpenAIService();
export default openaiService;