import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SybilAnalysisRequest {
  user_id: string;
  action_type?: "login" | "post" | "review" | "vote" | "claim_reward";
  metadata?: {
    ip_hash?: string;
    device_fingerprint?: string;
    session_duration?: number;
  };
}

interface SybilAnalysisResult {
  trust_score: number;
  risk_score: number;
  risk_level: "low" | "medium" | "high" | "critical";
  anomalies: string[];
  recommendations: string[];
  is_flagged: boolean;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!LOVABLE_API_KEY || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error("Required environment variables are not configured");
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const { user_id, action_type, metadata }: SybilAnalysisRequest = await req.json();

    console.log(`[Sybil Detection] Analyzing user ${user_id} for action: ${action_type}`);

    // 1. Get user profile data
    const { data: profile } = await supabase
      .from("profiles")
      .select("id, created_at, reputation, followers_count, following_count, tokens_earned, wallet_address")
      .eq("id", user_id)
      .single();

    if (!profile) {
      return new Response(
        JSON.stringify({ error: "User not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 2. Get user behavior history
    const { data: behaviorHistory } = await supabase
      .from("user_behavior_graph")
      .select("*")
      .eq("user_id", user_id)
      .order("timestamp", { ascending: false })
      .limit(100);

    // 3. Get user's review history
    const { data: reviews } = await supabase
      .from("reviews")
      .select("id, quality_score, created_at, is_flagged")
      .eq("author_id", user_id)
      .order("created_at", { ascending: false })
      .limit(50);

    // 4. Get user's post history
    const { data: posts } = await supabase
      .from("posts")
      .select("id, likes_count, created_at")
      .eq("author_id", user_id)
      .order("created_at", { ascending: false })
      .limit(50);

    // 5. Get user's votes
    const { data: votes } = await supabase
      .from("governance_votes")
      .select("id, created_at, voting_power")
      .eq("user_id", user_id)
      .order("created_at", { ascending: false })
      .limit(50);

    // 6. Record this behavior action
    if (action_type && metadata) {
      await supabase.from("user_behavior_graph").insert({
        user_id,
        behavior_type: action_type,
        ip_hash: metadata.ip_hash,
        device_fingerprint: metadata.device_fingerprint,
        session_duration_seconds: metadata.session_duration,
        metadata: metadata
      });
    }

    // 7. Calculate behavior metrics
    const accountAgeDays = profile.created_at 
      ? Math.floor((Date.now() - new Date(profile.created_at).getTime()) / (1000 * 60 * 60 * 24))
      : 0;

    const reviewCount = reviews?.length || 0;
    const postCount = posts?.length || 0;
    const voteCount = votes?.length || 0;
    const flaggedReviews = reviews?.filter((r: any) => r.is_flagged).length || 0;
    const avgReviewQuality = reviews?.length
      ? reviews.reduce((sum: number, r: any) => sum + (r.quality_score || 0), 0) / reviews.length
      : 0;

    // Analyze behavior patterns
    const anomalies: string[] = [];
    let riskScore = 0;

    // Check 1: New account with high activity
    if (accountAgeDays < 7 && (reviewCount > 20 || postCount > 10)) {
      anomalies.push("Unusually high activity for new account");
      riskScore += 20;
    }

    // Check 2: Rapid-fire reviews (more than 10 in a day)
    if (reviews?.length) {
      const reviewDates = reviews.map((r: any) => new Date(r.created_at).toDateString());
      const dateGroups = reviewDates.reduce((acc: any, date: string) => {
        acc[date] = (acc[date] || 0) + 1;
        return acc;
      }, {});
      const maxDailyReviews = Math.max(...Object.values(dateGroups) as number[]);
      if (maxDailyReviews > 10) {
        anomalies.push(`High review velocity: ${maxDailyReviews} reviews in one day`);
        riskScore += 15;
      }
    }

    // Check 3: Low quality content
    if (avgReviewQuality < 30 && reviewCount > 5) {
      anomalies.push("Consistently low-quality content");
      riskScore += 25;
    }

    // Check 4: High flagged content ratio
    if (flaggedReviews > 0 && reviewCount > 0) {
      const flagRatio = flaggedReviews / reviewCount;
      if (flagRatio > 0.3) {
        anomalies.push(`High flagged content ratio: ${(flagRatio * 100).toFixed(0)}%`);
        riskScore += 30;
      }
    }

    // Check 5: Follow/following ratio (potential bots follow many, have few followers)
    const followRatio = (profile.following_count || 0) / Math.max(profile.followers_count || 1, 1);
    if (followRatio > 10 && (profile.following_count || 0) > 50) {
      anomalies.push("Suspicious follow pattern: following many, few followers");
      riskScore += 15;
    }

    // Check 6: Device/IP patterns (would need more behavior data)
    if (behaviorHistory?.length) {
      const uniqueIPs = new Set(behaviorHistory.map((b: any) => b.ip_hash).filter(Boolean)).size;
      const uniqueDevices = new Set(behaviorHistory.map((b: any) => b.device_fingerprint).filter(Boolean)).size;
      
      // Multiple devices from single IP could indicate sharing
      if (uniqueDevices > 3 && uniqueIPs === 1) {
        anomalies.push("Multiple device fingerprints from single IP");
        riskScore += 10;
      }
    }

    // Check 7: Wallet behavior (if connected)
    if (profile.wallet_address) {
      // Check for other accounts with same wallet
      const { data: sameWalletAccounts } = await supabase
        .from("profiles")
        .select("id")
        .eq("wallet_address", profile.wallet_address)
        .neq("id", user_id);

      if (sameWalletAccounts && sameWalletAccounts.length > 0) {
        anomalies.push(`Same wallet address used by ${sameWalletAccounts.length} other accounts`);
        riskScore += 35;
      }
    }

    // 8. Calculate trust score (inverse of risk)
    const trustScore = Math.max(0, Math.min(100, 100 - riskScore + 
      Math.min(accountAgeDays * 0.5, 20) + // Age bonus
      Math.min(avgReviewQuality * 0.2, 15) + // Quality bonus
      (profile.reputation || 0) * 0.1 // Reputation bonus
    ));

    // Determine risk level
    let riskLevel: "low" | "medium" | "high" | "critical";
    if (riskScore < 20) riskLevel = "low";
    else if (riskScore < 40) riskLevel = "medium";
    else if (riskScore < 70) riskLevel = "high";
    else riskLevel = "critical";

    const isFlagged = riskLevel === "critical" || riskScore >= 70;

    // Generate recommendations
    const recommendations: string[] = [];
    if (anomalies.length === 0) {
      recommendations.push("Account behavior appears normal");
    } else {
      if (riskLevel === "critical") {
        recommendations.push("Manual review recommended before any token distributions");
        recommendations.push("Consider temporary restriction on reward claims");
      } else if (riskLevel === "high") {
        recommendations.push("Monitor account activity closely");
        recommendations.push("Apply stricter quality checks to content");
      } else {
        recommendations.push("Continue monitoring for patterns");
      }
    }

    // 9. Update sybil detection record
    await supabase
      .from("sybil_detection")
      .upsert({
        user_id,
        trust_score: trustScore,
        sybil_risk_score: riskScore,
        behavior_anomalies: anomalies,
        is_flagged: isFlagged,
        flag_reason: isFlagged ? anomalies.join("; ") : null,
        last_analysis_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }, { onConflict: "user_id" });

    const result: SybilAnalysisResult = {
      trust_score: Math.round(trustScore * 100) / 100,
      risk_score: riskScore,
      risk_level: riskLevel,
      anomalies,
      recommendations,
      is_flagged: isFlagged
    };

    console.log(`[Sybil Detection] User ${user_id}: Trust=${trustScore.toFixed(1)}, Risk=${riskLevel}, Flagged=${isFlagged}`);

    return new Response(
      JSON.stringify(result),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("[Sybil Detection] Error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
