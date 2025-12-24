// Hook for real-time review analysis
import { useState, useEffect } from 'react';
import { realTimeReviewAnalyzer, ReviewAnalysis } from '@/services/realTimeReviewAnalysis';

export function useRealTimeReviewAnalysis(content: string, rating: number) {
  const [analysis, setAnalysis] = useState<ReviewAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    if (!content.trim()) {
      setAnalysis(null);
      setIsAnalyzing(false);
      return;
    }

    setIsAnalyzing(true);

    realTimeReviewAnalyzer.analyzeReview(content, rating)
      .then((result) => {
        setAnalysis(result);
        setIsAnalyzing(false);
      })
      .catch((error) => {
        console.error('Review analysis error:', error);
        setIsAnalyzing(false);
      });
  }, [content, rating]);

  return {
    analysis,
    isAnalyzing,
    hasAnalysis: analysis !== null
  };
}