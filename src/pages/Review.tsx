import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { mockPosts } from "@/data/mockData";
import { getCategoryGradient } from "@/data/categories";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useReviewScoring, useModeratdedSubmission } from "@/hooks/useAIModeration";
import { useRealTimeReviewAnalysis } from "@/hooks/useRealTimeReviewAnalysis";
import { 
  ArrowLeft, 
  Star,
  Coins,
  BadgeCheck,
  Sparkles,
  Send,
  AlertCircle,
  Shield,
  Brain,
  Eye,
  TrendingUp,
  TrendingDown,
  Zap
} from "lucide-react";

export default function Review() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const post = mockPosts.find(p => p.id === id) || mockPosts[0];
  
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [aiScoring, setAiScoring] = useState(false);
  const [scoreResult, setScoreResult] = useState<{
    quality_score: number;
    tokens_earned: number;
    strengths: string[];
    areas_for_improvement: string[];
  } | null>(null);

  const reviewScoring = useReviewScoring();
  const checkContent = useModeratdedSubmission();
  const { analysis, isAnalyzing } = useRealTimeReviewAnalysis(content, rating);

  // Use real-time analysis for estimated reward, fallback to simple calculation
  const estimatedReward = analysis?.estimatedReward ?? 0;

  const handleSubmit = async () => {
    if (rating === 0) {
      toast.error("Please select a rating");
      return;
    }
    if (content.length < 50) {
      toast.error("Review must be at least 50 characters");
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Check if user is authenticated
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error("Please sign in to submit a review");
        setIsSubmitting(false);
        return;
      }

      // Pre-check content with AI moderation
      const moderationResult = await checkContent("review", content, {
        post_title: post.content.substring(0, 100),
        category: post.category,
      });

      if (!moderationResult.allowed) {
        toast.error(moderationResult.reason || "Your review didn't pass moderation");
        setIsSubmitting(false);
        return;
      }

      // Submit review to database
      const { data: review, error: reviewError } = await supabase
        .from("reviews")
        .insert({
          post_id: id,
          author_id: user.id,
          content,
          rating,
        })
        .select()
        .single();

      if (reviewError) {
        throw reviewError;
      }

      setAiScoring(true);

      // Score the review with AI
      const scoreData = await reviewScoring.mutateAsync({
        reviewId: review.id,
        reviewContent: content,
        rating,
        postTitle: post.content.substring(0, 100),
        postCategory: post.category,
      });

      setScoreResult({
        quality_score: scoreData.quality_score,
        tokens_earned: scoreData.tokens_earned,
        strengths: scoreData.analysis.strengths,
        areas_for_improvement: scoreData.analysis.areas_for_improvement,
      });

      setAiScoring(false);

      // Show success with actual AI-determined reward
      toast.success("Review submitted successfully!", {
        description: `Quality: ${scoreData.quality_score}% | Earned ${scoreData.tokens_earned} CDT tokens!`,
      });

      // Navigate after a short delay to show the score
      setTimeout(() => {
        navigate(`/post/${id}`);
      }, 2000);

    } catch (error: any) {
      console.error("Review submission error:", error);
      toast.error(error.message || "Failed to submit review");
      setIsSubmitting(false);
      setAiScoring(false);
    }
  };

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto py-6 px-4">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Link to={`/post/${id}`}>
            <Button variant="ghost" size="icon-sm">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-xl font-bold">Write a Review</h1>
            <p className="text-sm text-muted-foreground">Share your thoughts and earn tokens</p>
          </div>
        </div>

        {/* Post Preview */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex gap-4">
              <img 
                src={post.mediaUrl} 
                alt=""
                className="w-20 h-20 rounded-lg object-cover"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <div className={cn(
                    "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white",
                    `bg-gradient-to-br ${getCategoryGradient(post.category)}`
                  )}>
                    {post.author.displayName.charAt(0)}
                  </div>
                  <span className="font-medium text-sm">{post.author.displayName}</span>
                  {post.author.isVerified && (
                    <BadgeCheck className="w-4 h-4 text-primary fill-primary/20" />
                  )}
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2">{post.content}</p>
                <Badge variant="outline" className="mt-2 text-xs capitalize">
                  {post.category}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Rating Section */}
        <div className="mb-6">
          <label className="text-sm font-medium mb-3 block">Your Rating</label>
          <div className="flex items-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoveredRating(star)}
                onMouseLeave={() => setHoveredRating(0)}
                className="p-1 transition-transform hover:scale-110"
              >
                <Star 
                  className={cn(
                    "w-10 h-10 transition-colors",
                    (hoveredRating || rating) >= star 
                      ? "text-warning fill-warning" 
                      : "text-muted-foreground"
                  )} 
                />
              </button>
            ))}
            {rating > 0 && (
              <span className="ml-2 text-lg font-semibold">{rating}.0</span>
            )}
          </div>
        </div>

        {/* Review Content */}
        <div className="mb-6">
          <label className="text-sm font-medium mb-3 block">Your Review</label>
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Share your detailed thoughts about this content. What did you like? What could be improved? Be constructive and helpful..."
            className="min-h-[200px] resize-none"
          />
          <div className="flex items-center justify-between mt-2">
            <span className={cn(
              "text-xs",
              content.length < 50 ? "text-muted-foreground" : "text-success"
            )}>
              {content.length}/50 minimum characters
            </span>
            {content.length < 50 && (
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                Need {50 - content.length} more characters
              </span>
            )}
          </div>
        </div>

        {/* Real-time AI Analysis */}
        {content.length >= 20 && (
          <Card className={cn(
            "mb-6 transition-all duration-300",
            analysis?.isAiGenerated ? "border-destructive/50 bg-destructive/5" : 
            analysis?.authenticityScore && analysis.authenticityScore > 70 ? "border-success/50 bg-success/5" :
            "border-warning/50 bg-warning/5"
          )}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Brain className={cn(
                    "w-4 h-4",
                    isAnalyzing ? "animate-pulse text-primary" : "text-muted-foreground"
                  )} />
                  <span className="text-sm font-medium">
                    {isAnalyzing ? "Analyzing..." : "AI Analysis"}
                  </span>
                </div>
                {analysis && (
                  <div className="flex items-center gap-2">
                    <Badge variant={analysis.isAiGenerated ? "destructive" : "success"} className="text-xs">
                      {analysis.isAiGenerated ? "AI Detected" : "Human-like"}
                    </Badge>
                  </div>
                )}
              </div>

              {analysis && (
                <div className="space-y-3">
                  {/* Scores */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="text-center p-2 rounded-lg bg-background/50">
                      <div className="flex items-center justify-center gap-1 mb-1">
                        <Eye className="w-3 h-3 text-primary" />
                        <span className="text-xs font-medium">Authenticity</span>
                      </div>
                      <p className={cn(
                        "text-lg font-bold",
                        analysis.authenticityScore > 70 ? "text-success" :
                        analysis.authenticityScore > 40 ? "text-warning" : "text-destructive"
                      )}>
                        {analysis.authenticityScore}%
                      </p>
                    </div>
                    <div className="text-center p-2 rounded-lg bg-background/50">
                      <div className="flex items-center justify-center gap-1 mb-1">
                        <TrendingUp className="w-3 h-3 text-primary" />
                        <span className="text-xs font-medium">Quality</span>
                      </div>
                      <p className={cn(
                        "text-lg font-bold",
                        analysis.qualityScore > 70 ? "text-success" :
                        analysis.qualityScore > 40 ? "text-warning" : "text-destructive"
                      )}>
                        {analysis.qualityScore}%
                      </p>
                    </div>
                    <div className="text-center p-2 rounded-lg bg-background/50">
                      <div className="flex items-center justify-center gap-1 mb-1">
                        <Zap className="w-3 h-3 text-primary" />
                        <span className="text-xs font-medium">AI Risk</span>
                      </div>
                      <p className={cn(
                        "text-lg font-bold",
                        analysis.aiConfidence < 30 ? "text-success" :
                        analysis.aiConfidence < 70 ? "text-warning" : "text-destructive"
                      )}>
                        {analysis.aiConfidence}%
                      </p>
                    </div>
                  </div>

                  {/* Feedback */}
                  {analysis.feedback.warnings.length > 0 && (
                    <div className="p-2 rounded-lg bg-destructive/10 border border-destructive/20">
                      <p className="text-xs font-medium text-destructive mb-1">⚠️ Warnings:</p>
                      <ul className="text-xs text-destructive/80 space-y-1">
                        {analysis.feedback.warnings.map((warning, i) => (
                          <li key={i}>• {warning}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {analysis.feedback.strengths.length > 0 && (
                    <div className="p-2 rounded-lg bg-success/10 border border-success/20">
                      <p className="text-xs font-medium text-success mb-1">✅ Strengths:</p>
                      <ul className="text-xs text-success/80 space-y-1">
                        {analysis.feedback.strengths.map((strength, i) => (
                          <li key={i}>• {strength}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {analysis.feedback.improvements.length > 0 && (
                    <div className="p-2 rounded-lg bg-warning/10 border border-warning/20">
                      <p className="text-xs font-medium text-warning mb-1">💡 Suggestions:</p>
                      <ul className="text-xs text-warning/80 space-y-1">
                        {analysis.feedback.improvements.map((improvement, i) => (
                          <li key={i}>• {improvement}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Metrics */}
                  <div className="text-xs text-muted-foreground border-t pt-2">
                    <div className="flex justify-between">
                      <span>Words: {analysis.metrics.wordCount}</span>
                      <span>Sentences: {analysis.metrics.sentenceCount}</span>
                      <span>Readability: {Math.round(analysis.metrics.readabilityScore)}%</span>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* AI Scoring Progress */}
        {aiScoring && (
          <Card variant="gradient" className="mb-6 border-primary/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3 mb-3">
                <Brain className="w-5 h-5 text-primary animate-pulse" />
                <span className="font-medium">AI is analyzing your review...</span>
              </div>
              <Progress value={75} className="h-2" />
              <p className="text-xs text-muted-foreground mt-2">
                Evaluating quality, helpfulness, and determining token rewards
              </p>
            </CardContent>
          </Card>
        )}

        {/* Score Result */}
        {scoreResult && (
          <Card variant="gradient" className="mb-6 border-success/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-success/20 flex items-center justify-center">
                    <Shield className="w-5 h-5 text-success" />
                  </div>
                  <div>
                    <p className="font-medium">AI Quality Score</p>
                    <p className="text-xs text-muted-foreground">Your review has been analyzed</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold text-success">{scoreResult.quality_score}%</p>
                  <p className="text-sm text-primary font-medium">+{scoreResult.tokens_earned} CDT</p>
                </div>
              </div>
              {scoreResult.strengths.length > 0 && (
                <div className="mb-2">
                  <p className="text-xs font-medium text-success mb-1">Strengths:</p>
                  <p className="text-xs text-muted-foreground">{scoreResult.strengths.join(", ")}</p>
                </div>
              )}
              {scoreResult.areas_for_improvement.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-warning mb-1">Tips for next time:</p>
                  <p className="text-xs text-muted-foreground">{scoreResult.areas_for_improvement.join(", ")}</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Reward Estimate (only show before submission) */}
        {!scoreResult && !aiScoring && (
          <Card variant="gradient" className="mb-6">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                    <Coins className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Estimated Reward</p>
                    <p className="text-xs text-muted-foreground">
                      {analysis ? "Based on AI analysis" : "Start typing for AI analysis"}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={cn(
                    "text-2xl font-bold drop-shadow-sm transition-colors",
                    estimatedReward === 0 ? "text-muted-foreground" :
                    estimatedReward < 10 ? "text-destructive" :
                    estimatedReward < 25 ? "text-warning" : "text-success"
                  )}>
                    {estimatedReward}
                  </p>
                  <p className="text-xs text-foreground/80">
                    tokens {analysis ? "(live estimate)" : "(estimate)"}
                  </p>
                  {analysis?.isAiGenerated && (
                    <p className="text-xs text-destructive mt-1">
                      ⚠️ AI content penalty applied
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Guidelines */}
        <Card className="mb-6 border-dashed">
          <CardContent className="p-4">
            <h3 className="font-medium mb-2 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" />
              Real-time AI Review Analysis
            </h3>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• <strong>Real-time analysis</strong> as you type (after 20 characters)</li>
              <li>• <strong>AI detection</strong> - authentic reviews earn more tokens</li>
              <li>• <strong>Quality scoring</strong> based on detail, clarity, and helpfulness</li>
              <li>• Be honest, specific, and personal in your feedback</li>
              <li>• <strong>Higher authenticity</strong> = higher rewards (up to 50+ CDT)</li>
              <li>• <strong>AI-generated content</strong> receives minimal rewards</li>
            </ul>
          </CardContent>
        </Card>

        {/* Submit Button */}
        <Button 
          variant="glow" 
          size="lg"
          className="w-full"
          onClick={handleSubmit}
          disabled={rating === 0 || content.length < 50 || isSubmitting || !!scoreResult}
        >
          {isSubmitting ? (
            aiScoring ? (
              <>
                <Brain className="w-4 h-4 mr-2 animate-pulse" />
                AI Scoring...
              </>
            ) : (
              <>
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                Submitting...
              </>
            )
          ) : scoreResult ? (
            <>
              <BadgeCheck className="w-4 h-4 mr-2" />
              Review Submitted!
            </>
          ) : (
            <>
              <Send className="w-4 h-4 mr-2" />
              Submit Review
            </>
          )}
        </Button>
      </div>
    </AppLayout>
  );
}
