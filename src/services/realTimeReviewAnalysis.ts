// Real-time Review Analysis Service
// Analyzes reviews as users type for AI detection and authenticity scoring

export interface ReviewAnalysis {
  isAiGenerated: boolean;
  aiConfidence: number; // 0-100, higher means more likely AI-generated
  authenticityScore: number; // 0-100, higher means more authentic
  qualityScore: number; // 0-100, overall quality
  estimatedReward: number; // Calculated token reward
  feedback: {
    strengths: string[];
    improvements: string[];
    warnings: string[];
  };
  metrics: {
    wordCount: number;
    sentenceCount: number;
    avgWordsPerSentence: number;
    uniqueWords: number;
    readabilityScore: number;
  };
}

class RealTimeReviewAnalyzer {
  private debounceTimer: NodeJS.Timeout | null = null;
  private readonly DEBOUNCE_DELAY = 1000; // 1 second delay
  private readonly MIN_ANALYSIS_LENGTH = 20; // Minimum characters for analysis

  // AI-generated content detection patterns
  private readonly AI_PATTERNS = [
    // Common AI phrases
    /as an ai|i'm an ai|i am an ai/i,
    /in conclusion|to summarize|in summary/i,
    /it's worth noting|it's important to note/i,
    /overall|furthermore|moreover|additionally/i,
    /comprehensive|extensive|thorough/i,
    // Repetitive patterns
    /(.{10,})\1{2,}/i, // Repeated phrases
    // Overly formal language
    /utilize|facilitate|endeavor|commence/i,
    // Perfect grammar patterns (too perfect)
    /^[A-Z][^.!?]*[.!?](\s+[A-Z][^.!?]*[.!?])*$/,
  ];

  // Authenticity indicators
  private readonly AUTHENTIC_PATTERNS = [
    // Personal experiences
    /i felt|i experienced|i noticed|i found|i think|i believe/i,
    /my experience|personally|in my opinion/i,
    // Emotional language
    /love|hate|amazing|terrible|awesome|disappointing/i,
    // Casual language
    /really|pretty|kinda|sorta|gonna|wanna/i,
    // Specific details
    /\d+\s*(minutes?|hours?|days?|weeks?|months?)/i,
    // Questions and uncertainty
    /\?|maybe|perhaps|might|could be/i,
  ];

  analyzeReview(content: string, rating: number): Promise<ReviewAnalysis> {
    return new Promise((resolve) => {
      // Clear existing timer
      if (this.debounceTimer) {
        clearTimeout(this.debounceTimer);
      }

      // If content is too short, return minimal analysis
      if (content.length < this.MIN_ANALYSIS_LENGTH) {
        resolve({
          isAiGenerated: false,
          aiConfidence: 0,
          authenticityScore: 0,
          qualityScore: 0,
          estimatedReward: 0,
          feedback: {
            strengths: [],
            improvements: ['Write more to get a better analysis'],
            warnings: []
          },
          metrics: this.calculateMetrics(content)
        });
        return;
      }

      // Debounce the analysis
      this.debounceTimer = setTimeout(() => {
        const analysis = this.performAnalysis(content, rating);
        resolve(analysis);
      }, this.DEBOUNCE_DELAY);
    });
  }

  private performAnalysis(content: string, rating: number): ReviewAnalysis {
    const metrics = this.calculateMetrics(content);
    const aiConfidence = this.detectAiGenerated(content, metrics);
    const authenticityScore = this.calculateAuthenticity(content, metrics, aiConfidence);
    const qualityScore = this.calculateQuality(content, rating, metrics, authenticityScore);
    const estimatedReward = this.calculateReward(qualityScore, authenticityScore, metrics);
    const feedback = this.generateFeedback(content, metrics, aiConfidence, authenticityScore);

    return {
      isAiGenerated: aiConfidence > 70,
      aiConfidence,
      authenticityScore,
      qualityScore,
      estimatedReward,
      feedback,
      metrics
    };
  }

  private calculateMetrics(content: string) {
    const words = content.trim().split(/\s+/).filter(word => word.length > 0);
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const uniqueWords = new Set(words.map(w => w.toLowerCase())).size;
    
    return {
      wordCount: words.length,
      sentenceCount: sentences.length,
      avgWordsPerSentence: sentences.length > 0 ? words.length / sentences.length : 0,
      uniqueWords,
      readabilityScore: this.calculateReadability(words, sentences)
    };
  }

  private calculateReadability(words: string[], sentences: string[]): number {
    if (sentences.length === 0 || words.length === 0) return 0;
    
    // Simplified Flesch Reading Ease formula
    const avgSentenceLength = words.length / sentences.length;
    const avgSyllables = words.reduce((sum, word) => sum + this.countSyllables(word), 0) / words.length;
    
    const score = 206.835 - (1.015 * avgSentenceLength) - (84.6 * avgSyllables);
    return Math.max(0, Math.min(100, score));
  }

  private countSyllables(word: string): number {
    word = word.toLowerCase();
    if (word.length <= 3) return 1;
    
    const vowels = word.match(/[aeiouy]+/g);
    let syllables = vowels ? vowels.length : 1;
    
    if (word.endsWith('e')) syllables--;
    if (syllables === 0) syllables = 1;
    
    return syllables;
  }

  private detectAiGenerated(content: string, metrics: any): number {
    let aiScore = 0;
    let totalChecks = 0;

    // Check for AI patterns
    this.AI_PATTERNS.forEach(pattern => {
      totalChecks++;
      if (pattern.test(content)) {
        aiScore += 15;
      }
    });

    // Check sentence structure (AI tends to be very consistent)
    if (metrics.avgWordsPerSentence > 15 && metrics.avgWordsPerSentence < 25) {
      aiScore += 10; // AI often has consistent sentence length
    }

    // Check vocabulary diversity (AI often has lower diversity)
    const vocabularyDiversity = metrics.uniqueWords / metrics.wordCount;
    if (vocabularyDiversity < 0.6) {
      aiScore += 10;
    }

    // Check for perfect grammar (suspiciously perfect)
    const hasTypos = /\b(teh|recieve|seperate|definately|occured)\b/i.test(content);
    const hasContractions = /\b(don't|won't|can't|isn't|aren't|wasn't|weren't)\b/i.test(content);
    
    if (!hasTypos && !hasContractions && content.length > 100) {
      aiScore += 15; // Too perfect might be AI
    }

    return Math.min(100, aiScore);
  }

  private calculateAuthenticity(content: string, metrics: any, aiConfidence: number): number {
    let authenticityScore = 100 - aiConfidence; // Start with inverse of AI confidence
    
    // Check for authentic patterns
    let authenticPatterns = 0;
    this.AUTHENTIC_PATTERNS.forEach(pattern => {
      if (pattern.test(content)) {
        authenticPatterns++;
      }
    });

    // Boost score for authentic patterns
    authenticityScore += authenticPatterns * 5;

    // Check for personal experiences and emotions
    const personalWords = (content.match(/\b(i|me|my|myself|personally)\b/gi) || []).length;
    const emotionalWords = (content.match(/\b(love|hate|excited|disappointed|amazing|terrible|wonderful|awful)\b/gi) || []).length;
    
    authenticityScore += Math.min(20, personalWords * 2);
    authenticityScore += Math.min(15, emotionalWords * 3);

    // Check for specific details (authentic reviews often have specifics)
    const specificDetails = (content.match(/\b\d+\b/g) || []).length;
    authenticityScore += Math.min(10, specificDetails * 2);

    return Math.max(0, Math.min(100, authenticityScore));
  }

  private calculateQuality(content: string, rating: number, metrics: any, authenticityScore: number): number {
    let qualityScore = 0;

    // Length quality (optimal range)
    if (metrics.wordCount >= 50 && metrics.wordCount <= 300) {
      qualityScore += 25;
    } else if (metrics.wordCount >= 20) {
      qualityScore += 15;
    }

    // Readability
    if (metrics.readabilityScore >= 30 && metrics.readabilityScore <= 80) {
      qualityScore += 20;
    }

    // Vocabulary diversity
    const vocabularyDiversity = metrics.uniqueWords / metrics.wordCount;
    if (vocabularyDiversity > 0.7) {
      qualityScore += 15;
    }

    // Sentence structure variety
    if (metrics.avgWordsPerSentence >= 8 && metrics.avgWordsPerSentence <= 20) {
      qualityScore += 15;
    }

    // Authenticity bonus
    qualityScore += authenticityScore * 0.25;

    // Rating consistency (if they give detailed review, rating should make sense)
    if (content.length > 100) {
      qualityScore += 10;
    }

    return Math.max(0, Math.min(100, qualityScore));
  }

  private calculateReward(qualityScore: number, authenticityScore: number, metrics: any): number {
    // If quality is below 50%, no tokens are awarded
    if (qualityScore < 50) {
      return 0;
    }

    // Base reward calculation
    let reward = 0;

    // Quality-based reward (0-30 tokens)
    reward += (qualityScore / 100) * 30;

    // Authenticity bonus (0-15 tokens)
    reward += (authenticityScore / 100) * 15;

    // Length bonus (0-10 tokens)
    if (metrics.wordCount >= 100) {
      reward += 10;
    } else if (metrics.wordCount >= 50) {
      reward += 5;
    }

    // Penalize likely AI content
    if (authenticityScore < 30) {
      reward *= 0.1; // Severe penalty for likely AI content
    } else if (authenticityScore < 50) {
      reward *= 0.5; // Moderate penalty
    }

    return Math.floor(Math.max(0, reward));
  }

  private generateFeedback(content: string, metrics: any, aiConfidence: number, authenticityScore: number) {
    const feedback = {
      strengths: [] as string[],
      improvements: [] as string[],
      warnings: [] as string[]
    };

    // Calculate quality score for feedback
    const qualityScore = this.calculateQuality(content, 5, metrics, authenticityScore);

    // Strengths
    if (metrics.wordCount >= 100) {
      feedback.strengths.push('Good length and detail');
    }
    if (authenticityScore > 70) {
      feedback.strengths.push('Authentic and personal tone');
    }
    if (metrics.readabilityScore >= 50) {
      feedback.strengths.push('Clear and readable');
    }
    if (qualityScore >= 70) {
      feedback.strengths.push('High quality review');
    }

    // Improvements
    if (metrics.wordCount < 50) {
      feedback.improvements.push('Add more detail and examples');
    }
    if (authenticityScore < 50) {
      feedback.improvements.push('Make it more personal and specific');
    }
    if (metrics.avgWordsPerSentence > 25) {
      feedback.improvements.push('Use shorter sentences for clarity');
    }
    if (qualityScore < 70 && qualityScore >= 50) {
      feedback.improvements.push('Add more specific details and examples');
    }

    // Warnings
    if (qualityScore < 50) {
      feedback.warnings.push('Quality too low - no tokens will be awarded');
    }
    if (aiConfidence > 70) {
      feedback.warnings.push('Content appears AI-generated - rewards will be minimal');
    } else if (aiConfidence > 50) {
      feedback.warnings.push('Content may appear artificial - add personal touches');
    }

    if (authenticityScore < 30) {
      feedback.warnings.push('Review lacks authenticity - be more specific and personal');
    }

    return feedback;
  }
}

export const realTimeReviewAnalyzer = new RealTimeReviewAnalyzer();