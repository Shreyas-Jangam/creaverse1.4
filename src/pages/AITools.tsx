import { AppLayout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { toast } from "sonner";
import { 
  Brain, 
  Sparkles, 
  Wand2, 
  MessageSquare, 
  Image as ImageIcon,
  FileText,
  Lightbulb,
  ArrowRight,
  Send,
  Copy,
  RefreshCw
} from "lucide-react";
import { useAutoTranslate } from "@/hooks/useTranslation";

const aiTools = [
  {
    id: "text-gen",
    title: "Text Generation",
    description: "Generate proposals, content, and documentation",
    icon: FileText,
    color: "from-blue-500 to-cyan-500",
  },
  {
    id: "prompt-assist",
    title: "Prompt Assistant",
    description: "Optimize your AI queries for better results",
    icon: Wand2,
    color: "from-purple-500 to-pink-500",
  },
  {
    id: "image-prompt",
    title: "Image Prompt Generator",
    description: "Create detailed prompts for visual content",
    icon: ImageIcon,
    color: "from-orange-500 to-red-500",
  },
  {
    id: "idea-gen",
    title: "Idea Generator",
    description: "Brainstorm creative concepts and projects",
    icon: Lightbulb,
    color: "from-yellow-500 to-orange-500",
  },
];

export default function AITools() {
  const [selectedTool, setSelectedTool] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const { t } = useAutoTranslate([
    "AI-Powered Tools",
    "Create with AI",
    "Leverage advanced AI to generate content, optimize prompts, and brainstorm ideas for your creative projects",
    "Text Generation",
    "Generate proposals, content, and documentation",
    "Prompt Assistant",
    "Optimize your AI queries for better results",
    "Image Prompt Generator",
    "Create detailed prompts for visual content",
    "Idea Generator",
    "Brainstorm creative concepts and projects",
    "Enter your prompt below and let AI assist you",
    "Enter your prompt here... (e.g., 'Write a proposal for community events')",
    "Generating...",
    "Generate",
    "AI Generated",
    "Copy",
    "Select a Tool to Get Started",
    "Choose one of the AI tools above to begin creating",
    "Please enter a prompt",
    "Content generated!",
    "Copied to clipboard!"
  ]);

  const handleGenerate = async () => {
    if (!input.trim()) {
      toast.error(t("Please enter a prompt"));
      return;
    }

    setIsGenerating(true);
    setOutput("");

    // Simulate AI generation
    await new Promise(resolve => setTimeout(resolve, 2000));

    const responses: Record<string, string> = {
      "text-gen": `# Generated Content\n\nBased on your prompt "${input}", here's a comprehensive draft:\n\n## Overview\nThis section provides an introduction to the topic at hand, establishing context and setting expectations for the reader.\n\n## Key Points\n1. First important aspect to consider\n2. Second crucial element to address\n3. Third significant factor to examine\n\n## Conclusion\nIn summary, these elements work together to create a cohesive and impactful result.`,
      "prompt-assist": `# Optimized Prompt\n\nOriginal: "${input}"\n\n## Enhanced Version:\n"You are an expert in [field]. Please provide a detailed, step-by-step analysis of ${input}. Include specific examples, potential challenges, and actionable recommendations. Format your response with clear headings and bullet points for easy readability."\n\n## Tips Applied:\n- Added role context\n- Requested specific format\n- Asked for examples\n- Included actionable elements`,
      "image-prompt": `# Image Prompt Generated\n\nBased on: "${input}"\n\n## Detailed Prompt:\n"A stunning digital artwork depicting ${input}, rendered in a cinematic style with dramatic lighting. The scene features rich, vibrant colors with a focus on atmospheric depth and intricate details. Ultra-high quality, 8K resolution, professional photography composition, trending on ArtStation."\n\n## Style Variations:\n- Photorealistic\n- Digital painting\n- Concept art\n- Abstract interpretation`,
      "idea-gen": `# Creative Ideas Generated\n\nPrompt: "${input}"\n\n## Top Concepts:\n\n### 1. The Core Concept\nA fresh take on ${input} that combines traditional elements with innovative approaches.\n\n### 2. The Alternative Angle\nExploring ${input} from an unexpected perspective that challenges conventional thinking.\n\n### 3. The Fusion Approach\nBlending ${input} with complementary themes to create something entirely new.\n\n### 4. The Minimalist Version\nDistilling ${input} to its essential elements for maximum impact.\n\n### 5. The Ambitious Vision\nAn expansive interpretation of ${input} that pushes creative boundaries.`,
    };

    setOutput(responses[selectedTool || "text-gen"] || responses["text-gen"]);
    setIsGenerating(false);
    toast.success(t("Content generated!"));
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(output);
    toast.success(t("Copied to clipboard!"));
  };

  const handleClear = () => {
    setInput("");
    setOutput("");
  };

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto py-6 px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-4">
            <Brain className="w-5 h-5 text-primary" />
            <span className="text-sm font-medium">{t("AI-Powered Tools")}</span>
          </div>
          <h1 className="text-3xl font-bold mb-2">{t("Create with AI")}</h1>
          <p className="text-muted-foreground max-w-lg mx-auto">
            {t("Leverage advanced AI to generate content, optimize prompts, and brainstorm ideas for your creative projects")}
          </p>
        </div>

        {/* Tool Selection */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {aiTools.map((tool) => {
            const Icon = tool.icon;
            const isSelected = selectedTool === tool.id;
            
            return (
              <button
                key={tool.id}
                onClick={() => setSelectedTool(tool.id)}
                className={`p-4 rounded-xl border-2 transition-all duration-300 text-left ${
                  isSelected
                    ? "border-primary bg-primary/10 shadow-lg"
                    : "border-border/50 bg-card/50 hover:border-primary/50"
                }`}
              >
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${tool.color} flex items-center justify-center mb-3`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <h3 className="font-semibold text-sm mb-1">{t(tool.title)}</h3>
                <p className="text-xs text-muted-foreground">{t(tool.description)}</p>
              </button>
            );
          })}
        </div>

        {/* AI Interface */}
        {selectedTool && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                {t(aiTools.find(tool => tool.id === selectedTool)?.title || "")}
              </CardTitle>
              <CardDescription>
                {t("Enter your prompt below and let AI assist you")}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Input */}
              <div>
                <Textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={t("Enter your prompt here... (e.g., 'Write a proposal for community events')")}
                  className="min-h-[120px] resize-none"
                />
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3">
                <Button 
                  variant="glow" 
                  onClick={handleGenerate}
                  disabled={isGenerating || !input.trim()}
                  className="flex-1"
                >
                  {isGenerating ? (
                    <>
                      <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                      {t("Generating...")}
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      {t("Generate")}
                    </>
                  )}
                </Button>
                <Button variant="outline" onClick={handleClear}>
                  <RefreshCw className="w-4 h-4" />
                </Button>
              </div>

              {/* Output */}
              {output && (
                <div className="mt-6 p-4 rounded-xl bg-muted/50 border border-border">
                  <div className="flex items-center justify-between mb-3">
                    <Badge variant="outline" className="text-xs">
                      <Sparkles className="w-3 h-3 mr-1" />
                      {t("AI Generated")}
                    </Badge>
                    <Button variant="ghost" size="sm" onClick={handleCopy}>
                      <Copy className="w-4 h-4 mr-1" />
                      {t("Copy")}
                    </Button>
                  </div>
                  <div className="prose prose-sm dark:prose-invert max-w-none">
                    <pre className="whitespace-pre-wrap font-sans text-sm text-foreground/90">
                      {output}
                    </pre>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Empty State */}
        {!selectedTool && (
          <Card className="border-dashed">
            <CardContent className="py-12 text-center">
              <Brain className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="font-semibold mb-2">{t("Select a Tool to Get Started")}</h3>
              <p className="text-sm text-muted-foreground">
                {t("Choose one of the AI tools above to begin creating")}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
}
