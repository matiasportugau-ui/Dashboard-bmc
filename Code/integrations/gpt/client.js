const axios = require('axios');
const winston = require('winston');

class GPTClient {
  constructor(apiKey = process.env.OPENAI_API_KEY) {
    this.apiKey = apiKey;
    this.baseURL = 'https://api.openai.com/v1';
    this.model = process.env.GPT_MODEL || 'gpt-4-turbo-preview';
    this.logger = this.createLogger();
  }

  createLogger() {
    return winston.createLogger({
      level: 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      ),
      transports: [
        new winston.transports.Console(),
        new winston.transports.File({ 
          filename: 'logs/gpt-client.log' 
        })
      ]
    });
  }

  async chat(messages, options = {}) {
    const {
      temperature = parseFloat(process.env.GPT_TEMPERATURE || '0.7'),
      maxTokens = parseInt(process.env.GPT_MAX_TOKENS || '4000'),
      stream = false,
      ...additionalOptions
    } = options;

    try {
      const response = await axios.post(
        `${this.baseURL}/chat/completions`,
        {
          model: this.model,
          messages,
          temperature,
          max_tokens: maxTokens,
          stream,
          ...additionalOptions
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      this.logger.info('GPT request successful', {
        model: this.model,
        messageCount: messages.length,
        tokensUsed: response.data.usage
      });

      return response.data;
    } catch (error) {
      this.logger.error('GPT request failed', {
        error: error.message,
        status: error.response?.status,
        data: error.response?.data
      });
      throw error;
    }
  }

  async generateCode(prompt, language = 'javascript', context = '') {
    const systemPrompt = `You are an expert ${language} developer. Generate clean, efficient, and well-documented code based on the user's requirements.`;
    
    const messages = [
      { role: 'system', content: systemPrompt }
    ];

    if (context) {
      messages.push({
        role: 'system',
        content: `Context:\n${context}`
      });
    }

    messages.push({ role: 'user', content: prompt });

    const response = await this.chat(messages, {
      temperature: 0.3, // Lower temperature for code generation
      maxTokens: 8000
    });

    return this.extractCode(response.choices[0].message.content);
  }

  async analyzeCode(code, analysisType = 'general') {
    const analysisPrompts = {
      general: 'Analyze this code and provide insights on quality, potential improvements, and best practices.',
      security: 'Analyze this code for security vulnerabilities and provide recommendations.',
      performance: 'Analyze this code for performance issues and optimization opportunities.',
      refactoring: 'Suggest refactoring improvements for this code to make it cleaner and more maintainable.'
    };

    const prompt = analysisPrompts[analysisType] || analysisPrompts.general;
    
    const messages = [
      {
        role: 'system',
        content: 'You are an expert code reviewer with deep knowledge of software engineering best practices.'
      },
      {
        role: 'user',
        content: `${prompt}\n\nCode:\n\`\`\`\n${code}\n\`\`\``
      }
    ];

    const response = await this.chat(messages, {
      temperature: 0.5
    });

    return this.parseAnalysis(response.choices[0].message.content);
  }

  async suggestImprovements(code, requirements) {
    const messages = [
      {
        role: 'system',
        content: 'You are an AI coding assistant helping to improve code based on specific requirements.'
      },
      {
        role: 'user',
        content: `Given the following code and requirements, suggest specific improvements:

Requirements: ${requirements}

Current Code:
\`\`\`
${code}
\`\`\`

Provide improved code with explanations for each change.`
      }
    ];

    const response = await this.chat(messages, {
      temperature: 0.4
    });

    return this.parseImprovements(response.choices[0].message.content);
  }

  extractCode(content) {
    const codeBlocks = [];
    const regex = /```(\w+)?\n([\s\S]*?)```/g;
    let match;

    while ((match = regex.exec(content)) !== null) {
      codeBlocks.push({
        language: match[1] || 'plaintext',
        code: match[2].trim()
      });
    }

    // Si no hay bloques de código, devolver el contenido completo
    if (codeBlocks.length === 0) {
      return [{
        language: 'plaintext',
        code: content.trim()
      }];
    }

    return codeBlocks;
  }

  parseAnalysis(content) {
    const analysis = {
      summary: '',
      issues: [],
      suggestions: [],
      codeQuality: {},
      raw: content
    };

    // Extraer secciones del análisis
    const sections = content.split(/\n(?=#{1,3}\s)/);
    
    for (const section of sections) {
      const lines = section.trim().split('\n');
      const header = lines[0].toLowerCase();
      
      if (header.includes('summary') || lines.length === 1) {
        analysis.summary = lines.slice(1).join('\n').trim() || section.trim();
      } else if (header.includes('issue') || header.includes('problem')) {
        analysis.issues = this.extractListItems(lines.slice(1));
      } else if (header.includes('suggestion') || header.includes('improvement')) {
        analysis.suggestions = this.extractListItems(lines.slice(1));
      } else if (header.includes('quality') || header.includes('metric')) {
        analysis.codeQuality = this.extractKeyValuePairs(lines.slice(1));
      }
    }

    return analysis;
  }

  parseImprovements(content) {
    const improvements = {
      improvedCode: [],
      explanations: [],
      summary: '',
      raw: content
    };

    // Extraer código mejorado
    improvements.improvedCode = this.extractCode(content);
    
    // Extraer explicaciones
    const explanationRegex = /(?:explanation|change|improvement):\s*(.+)/gi;
    let match;
    
    while ((match = explanationRegex.exec(content)) !== null) {
      improvements.explanations.push(match[1].trim());
    }

    // Extraer resumen si existe
    const summaryMatch = content.match(/(?:summary|overview):\s*(.+?)(?:\n|$)/i);
    if (summaryMatch) {
      improvements.summary = summaryMatch[1].trim();
    }

    return improvements;
  }

  extractListItems(lines) {
    const items = [];
    
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.match(/^[-*•]\s+/) || trimmed.match(/^\d+\.\s+/)) {
        items.push(trimmed.replace(/^[-*•]\s+/, '').replace(/^\d+\.\s+/, ''));
      }
    }
    
    return items;
  }

  extractKeyValuePairs(lines) {
    const pairs = {};
    
    for (const line of lines) {
      const match = line.match(/^(.+?):\s*(.+)$/);
      if (match) {
        const key = match[1].trim().toLowerCase().replace(/\s+/g, '_');
        pairs[key] = match[2].trim();
      }
    }
    
    return pairs;
  }

  // Método para trabajar con funciones (function calling)
  async callFunction(messages, functions, functionCall = 'auto') {
    try {
      const response = await axios.post(
        `${this.baseURL}/chat/completions`,
        {
          model: this.model,
          messages,
          functions,
          function_call: functionCall,
          temperature: 0.3
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const choice = response.data.choices[0];
      
      if (choice.message.function_call) {
        return {
          type: 'function_call',
          function: choice.message.function_call
        };
      }
      
      return {
        type: 'message',
        content: choice.message.content
      };
    } catch (error) {
      this.logger.error('Function call failed', error);
      throw error;
    }
  }
}

module.exports = GPTClient;