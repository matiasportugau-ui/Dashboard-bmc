/**
 * Sistema de Feedback y Mejora Iterativa
 * Gestiona el aprendizaje continuo y la mejora de los componentes del ecosistema
 */

const fs = require('fs').promises;
const path = require('path');

class FeedbackSystem {
  constructor(storagePath = './feedback-data') {
    this.storagePath = storagePath;
    this.feedbackData = {
      sessions: new Map(),
      patterns: new Map(),
      improvements: new Map(),
      metrics: new Map()
    };

    this.init();
  }

  async init() {
    try {
      await fs.mkdir(this.storagePath, { recursive: true });
      await this.loadFeedbackData();
    } catch (error) {
      console.error('Error initializing feedback system:', error);
    }
  }

  async loadFeedbackData() {
    try {
      const files = await fs.readdir(this.storagePath);
      for (const file of files) {
        if (file.endsWith('.json')) {
          const data = JSON.parse(await fs.readFile(path.join(this.storagePath, file), 'utf8'));
          this.feedbackData.sessions.set(data.sessionId, data);
        }
      }
    } catch (error) {
      console.log('No existing feedback data found, starting fresh');
    }
  }

  /**
   * Procesa feedback recibido de cualquier componente
   */
  async processFeedback(feedback) {
    console.log('Processing feedback:', feedback.type);

    // Almacenar feedback
    await this.storeFeedback(feedback);

    // Analizar patrones
    await this.analyzePatterns(feedback);

    // Generar insights
    const insights = await this.generateInsights(feedback);

    // Proponer mejoras
    const improvements = await this.proposeImprovements(feedback, insights);

    // Actualizar métricas
    await this.updateMetrics(feedback);

    return {
      feedbackId: feedback.id,
      insights,
      improvements,
      processedAt: new Date().toISOString()
    };
  }

  /**
   * Almacena feedback en el sistema de archivos
   */
  async storeFeedback(feedback) {
    const sessionData = this.feedbackData.sessions.get(feedback.sessionId) || {
      sessionId: feedback.sessionId,
      created: new Date().toISOString(),
      feedback: [],
      metrics: {}
    };

    sessionData.feedback.push(feedback);
    sessionData.lastUpdated = new Date().toISOString();

    this.feedbackData.sessions.set(feedback.sessionId, sessionData);

    // Guardar en archivo
    await fs.writeFile(
      path.join(this.storagePath, `${feedback.sessionId}.json`),
      JSON.stringify(sessionData, null, 2)
    );
  }

  /**
   * Analiza patrones en el feedback para identificar tendencias
   */
  async analyzePatterns(feedback) {
    const patternKey = `${feedback.component}-${feedback.type}`;

    const pattern = this.feedbackData.patterns.get(patternKey) || {
      component: feedback.component,
      type: feedback.type,
      occurrences: 0,
      trends: [],
      lastSeen: null
    };

    pattern.occurrences++;
    pattern.lastSeen = new Date().toISOString();

    // Analizar tendencia
    const trend = {
      timestamp: new Date().toISOString(),
      content: feedback.content,
      metadata: feedback.metadata
    };

    pattern.trends.push(trend);

    // Mantener solo las últimas 100 tendencias
    if (pattern.trends.length > 100) {
      pattern.trends = pattern.trends.slice(-100);
    }

    this.feedbackData.patterns.set(patternKey, pattern);

    // Guardar patrones globales
    await this.savePatterns();
  }

  /**
   * Genera insights basados en el feedback y patrones
   */
  async generateInsights(feedback) {
    const insights = [];

    // Insight basado en frecuencia
    const patternKey = `${feedback.component}-${feedback.type}`;
    const pattern = this.feedbackData.patterns.get(patternKey);

    if (pattern && pattern.occurrences > 5) {
      insights.push({
        type: 'HIGH_FREQUENCY',
        component: feedback.component,
        message: `High frequency of ${feedback.type} feedback in ${feedback.component}`,
        severity: pattern.occurrences > 10 ? 'high' : 'medium',
        suggestion: 'Consider reviewing component behavior or user training'
      });
    }

    // Insight basado en contenido
    if (feedback.content) {
      const contentInsights = await this.analyzeContent(feedback.content);
      insights.push(...contentInsights);
    }

    // Insight basado en métricas de rendimiento
    if (feedback.metadata && feedback.metadata.performance) {
      const perfInsights = await this.analyzePerformance(feedback.metadata.performance);
      insights.push(...perfInsights);
    }

    return insights;
  }

  /**
   * Propone mejoras basadas en insights
   */
  async proposeImprovements(feedback, insights) {
    const improvements = [];

    for (const insight of insights) {
      const improvement = await this.generateImprovement(insight, feedback);
      if (improvement) {
        improvements.push(improvement);

        // Almacenar mejora propuesta
        const improvementId = `${feedback.sessionId}-${Date.now()}`;
        this.feedbackData.improvements.set(improvementId, {
          id: improvementId,
          insight,
          improvement,
          status: 'proposed',
          created: new Date().toISOString()
        });
      }
    }

    return improvements;
  }

  /**
   * Actualiza métricas del sistema
   */
  async updateMetrics(feedback) {
    const metrics = this.feedbackData.metrics.get(feedback.sessionId) || {
      sessionId: feedback.sessionId,
      feedbackCount: 0,
      componentUsage: new Map(),
      improvementRate: 0,
      satisfactionScore: 0
    };

    metrics.feedbackCount++;
    metrics.lastFeedback = new Date().toISOString();

    // Actualizar uso por componente
    const componentUsage = metrics.componentUsage.get(feedback.component) || 0;
    metrics.componentUsage.set(feedback.component, componentUsage + 1);

    // Calcular satisfacción (basado en contenido del feedback)
    metrics.satisfactionScore = this.calculateSatisfactionScore(feedback, metrics);

    this.feedbackData.metrics.set(feedback.sessionId, metrics);
    await this.saveMetrics();
  }

  /**
   * Analiza el contenido del feedback para extraer insights
   */
  async analyzeContent(content) {
    const insights = [];

    // Análisis de sentimiento básico
    const sentiment = this.analyzeSentiment(content);
    if (sentiment.score < -0.3) {
      insights.push({
        type: 'NEGATIVE_SENTIMENT',
        message: 'Negative feedback detected',
        sentiment: sentiment.score,
        suggestion: 'Consider immediate attention to user concerns'
      });
    }

    // Detección de palabras clave
    const keywords = this.extractKeywords(content);
    if (keywords.includes('error') || keywords.includes('bug')) {
      insights.push({
        type: 'ERROR_REPORT',
        message: 'Potential error or bug reported',
        keywords,
        suggestion: 'Investigate technical issues'
      });
    }

    if (keywords.includes('slow') || keywords.includes('performance')) {
      insights.push({
        type: 'PERFORMANCE_ISSUE',
        message: 'Performance concern reported',
        keywords,
        suggestion: 'Analyze and optimize performance'
      });
    }

    return insights;
  }

  /**
   * Analiza métricas de rendimiento
   */
  async analyzePerformance(perfMetrics) {
    const insights = [];

    if (perfMetrics.responseTime > 5000) { // 5 segundos
      insights.push({
        type: 'SLOW_RESPONSE',
        message: 'Response time is above threshold',
        value: perfMetrics.responseTime,
        threshold: 5000,
        suggestion: 'Optimize response time or increase timeout'
      });
    }

    if (perfMetrics.errorRate > 0.1) { // 10%
      insights.push({
        type: 'HIGH_ERROR_RATE',
        message: 'Error rate is above acceptable threshold',
        value: perfMetrics.errorRate,
        threshold: 0.1,
        suggestion: 'Investigate and fix error sources'
      });
    }

    if (perfMetrics.memoryUsage > 0.9) { // 90%
      insights.push({
        type: 'HIGH_MEMORY_USAGE',
        message: 'Memory usage is critically high',
        value: perfMetrics.memoryUsage,
        threshold: 0.9,
        suggestion: 'Optimize memory usage or scale resources'
      });
    }

    return insights;
  }

  /**
   * Genera propuestas de mejora específicas
   */
  async generateImprovement(insight, feedback) {
    // Generar mejoras basadas en el tipo de insight
    switch (insight.type) {
      case 'HIGH_FREQUENCY':
        return {
          type: 'COMPONENT_REVIEW',
          component: insight.component,
          action: 'Conduct comprehensive review of component',
          priority: 'high',
          estimatedTime: '2-4 hours'
        };

      case 'NEGATIVE_SENTIMENT':
        return {
          type: 'USER_EXPERIENCE_IMPROVEMENT',
          action: 'Improve user interface and messaging',
          priority: 'high',
          estimatedTime: '1-2 hours'
        };

      case 'ERROR_REPORT':
        return {
          type: 'BUG_FIX',
          action: 'Investigate and fix reported issues',
          priority: 'critical',
          estimatedTime: '30 minutes - 2 hours'
        };

      case 'PERFORMANCE_ISSUE':
        return {
          type: 'PERFORMANCE_OPTIMIZATION',
          action: 'Analyze and optimize performance bottlenecks',
          priority: 'medium',
          estimatedTime: '1-3 hours'
        };

      case 'SLOW_RESPONSE':
        return {
          type: 'RESPONSE_TIME_OPTIMIZATION',
          action: 'Implement caching or optimization strategies',
          priority: 'medium',
          estimatedTime: '2-4 hours'
        };

      case 'HIGH_ERROR_RATE':
        return {
          type: 'ERROR_REDUCTION',
          action: 'Implement better error handling and validation',
          priority: 'high',
          estimatedTime: '1-2 hours'
        };

      default:
        return {
          type: 'GENERAL_IMPROVEMENT',
          action: 'Review and improve based on feedback',
          priority: 'low',
          estimatedTime: '30 minutes - 1 hour'
        };
    }
  }

  /**
   * Calcula puntuación de satisfacción basada en feedback
   */
  calculateSatisfactionScore(feedback, metrics) {
    let score = metrics.satisfactionScore || 5; // Base score

    // Ajustar basado en tipo de feedback
    switch (feedback.type) {
      case 'positive':
      case 'satisfaction':
        score = Math.min(10, score + 0.5);
        break;
      case 'issue':
      case 'bug':
      case 'error':
        score = Math.max(0, score - 1);
        break;
      case 'suggestion':
        score = Math.min(10, score + 0.2);
        break;
    }

    return score;
  }

  /**
   * Analiza sentimiento del texto
   */
  analyzeSentiment(text) {
    const positiveWords = ['great', 'excellent', 'good', 'perfect', 'amazing', 'love', 'like', 'awesome'];
    const negativeWords = ['bad', 'terrible', 'awful', 'hate', 'dislike', 'poor', 'worst', 'broken'];

    let score = 0;
    const words = text.toLowerCase().split(/\s+/);

    words.forEach(word => {
      if (positiveWords.includes(word)) score += 0.1;
      if (negativeWords.includes(word)) score -= 0.1;
    });

    return { score: Math.max(-1, Math.min(1, score)) };
  }

  /**
   * Extrae palabras clave del texto
   */
  extractKeywords(text) {
    // Filtros básicos para palabras comunes
    const stopWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by'];
    return text.toLowerCase()
      .split(/\s+/)
      .filter(word => word.length > 3 && !stopWords.includes(word))
      .slice(0, 10);
  }

  /**
   * Obtiene métricas generales del sistema
   */
  async getSystemMetrics() {
    const sessions = Array.from(this.feedbackData.sessions.values());
    const patterns = Array.from(this.feedbackData.patterns.values());

    return {
      totalSessions: sessions.length,
      totalFeedback: sessions.reduce((sum, s) => sum + s.feedback.length, 0),
      averageSatisfaction: sessions.reduce((sum, s) => sum + (s.metrics?.satisfactionScore || 0), 0) / sessions.length,
      mostActiveComponent: this.getMostActiveComponent(),
      commonIssues: patterns.filter(p => p.occurrences > 3).map(p => ({
        component: p.component,
        type: p.type,
        occurrences: p.occurrences
      })),
      improvementProposals: Array.from(this.feedbackData.improvements.values()).filter(i => i.status === 'proposed').length
    };
  }

  getMostActiveComponent() {
    const componentCounts = new Map();

    this.feedbackData.sessions.forEach(session => {
      session.feedback.forEach(fb => {
        const count = componentCounts.get(fb.component) || 0;
        componentCounts.set(fb.component, count + 1);
      });
    });

    let maxComponent = '';
    let maxCount = 0;

    componentCounts.forEach((count, component) => {
      if (count > maxCount) {
        maxCount = count;
        maxComponent = component;
      }
    });

    return maxComponent;
  }

  async savePatterns() {
    await fs.writeFile(
      path.join(this.storagePath, 'patterns.json'),
      JSON.stringify(Array.from(this.feedbackData.patterns.entries()), null, 2)
    );
  }

  async saveMetrics() {
    await fs.writeFile(
      path.join(this.storagePath, 'metrics.json'),
      JSON.stringify(Array.from(this.feedbackData.metrics.entries()), null, 2)
    );
  }

  /**
   * Genera reporte de mejora iterativa
   */
  async generateImprovementReport(sessionId = null) {
    const report = {
      generated: new Date().toISOString(),
      period: 'last-30-days',
      metrics: await this.getSystemMetrics(),
      topPatterns: Array.from(this.feedbackData.patterns.values())
        .sort((a, b) => b.occurrences - a.occurrences)
        .slice(0, 10),
      proposedImprovements: Array.from(this.feedbackData.improvements.values())
        .filter(i => i.status === 'proposed')
        .sort((a, b) => new Date(b.created) - new Date(a.created))
    };

    if (sessionId) {
      report.sessionSpecific = this.feedbackData.sessions.get(sessionId);
    }

    return report;
  }
}

module.exports = FeedbackSystem;