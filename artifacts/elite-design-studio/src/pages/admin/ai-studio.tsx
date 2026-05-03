import { useState } from "react";
import { Sparkles, Download, Wand2, RefreshCw } from "lucide-react";
import AdminLayout from "@/components/layout/admin-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useEnhancePrompt, useGenerateImage } from "@workspace/api-client-react";

export default function AIStudio() {
  const [prompt, setPrompt] = useState("");
  const [enhancedPrompt, setEnhancedPrompt] = useState("");
  const [imageBase64, setImageBase64] = useState("");
  const [useEnhanced, setUseEnhanced] = useState(true);
  const { toast } = useToast();

  const { mutateAsync: enhancePrompt, isPending: enhancing } = useEnhancePrompt();
  const { mutateAsync: generateImage, isPending: generating } = useGenerateImage();

  const handleEnhance = async () => {
    if (!prompt.trim()) return;
    try {
      const result = await enhancePrompt({ data: { prompt } });
      setEnhancedPrompt(result.enhanced ?? "");
      toast({ title: "Prompt enhanced" });
    } catch {
      toast({ title: "Enhancement failed", variant: "destructive" });
    }
  };

  const handleGenerate = async () => {
    const finalPrompt = (useEnhanced && enhancedPrompt) ? enhancedPrompt : prompt;
    if (!finalPrompt.trim()) {
      toast({ title: "Enter a prompt first", variant: "destructive" });
      return;
    }
    try {
      const result = await generateImage({ data: { prompt: finalPrompt, enhance: false } });
      setImageBase64(result.imageBase64);
      if (result.enhancedPrompt) setEnhancedPrompt(result.enhancedPrompt);
      toast({ title: "Image generated" });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Generation failed";
      toast({ title: "Generation failed", description: msg, variant: "destructive" });
    }
  };

  const handleDownload = () => {
    if (!imageBase64) return;
    const link = document.createElement("a");
    link.href = `data:image/jpeg;base64,${imageBase64}`;
    link.download = "elite-design-studio-ai.jpg";
    link.click();
  };

  return (
    <AdminLayout>
      <div className="p-6 max-w-6xl mx-auto">
        <div className="mb-8">
          <p className="text-xs tracking-[0.25em] uppercase text-primary mb-1">Admin</p>
          <h1 className="text-2xl font-bold flex items-center gap-3">
            <Sparkles size={22} className="text-primary" />
            AI Design Studio
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Generate photorealistic interior design images with AI. Describe your vision, enhance the prompt, then render.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: Prompt Panel */}
          <div className="space-y-5">
            {/* Input */}
            <Card className="bg-card border-border">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm tracking-wide font-semibold">Your Prompt</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  placeholder="e.g. A minimalist living room with marble floors, floor-to-ceiling windows, and warm evening light..."
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  rows={4}
                  className="bg-background border-border resize-none text-sm"
                />
                <Button
                  onClick={handleEnhance}
                  disabled={enhancing || !prompt.trim()}
                  variant="outline"
                  className="w-full text-xs tracking-[0.15em] uppercase border-primary/30 text-primary hover:bg-primary/10 gap-2"
                >
                  {enhancing ? (
                    <><RefreshCw size={14} className="animate-spin" /> Enhancing...</>
                  ) : (
                    <><Wand2 size={14} /> Enhance with AI</>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Enhanced prompt */}
            {enhancedPrompt && (
              <Card className="bg-card border-border border-primary/20">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm tracking-wide font-semibold">Enhanced Prompt</CardTitle>
                    <Badge variant="outline" className="text-[9px] tracking-[0.15em] uppercase border-primary/30 text-primary">AI Enhanced</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-xs text-muted-foreground leading-relaxed bg-muted p-3 rounded-lg">
                    {enhancedPrompt}
                  </p>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="use-enhanced"
                      checked={useEnhanced}
                      onChange={(e) => setUseEnhanced(e.target.checked)}
                      className="accent-primary"
                    />
                    <Label htmlFor="use-enhanced" className="text-xs text-muted-foreground cursor-pointer">
                      Use enhanced prompt for generation
                    </Label>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Generate button */}
            <Button
              onClick={handleGenerate}
              disabled={generating || !prompt.trim()}
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90 text-xs tracking-[0.2em] uppercase font-medium py-5 gap-2"
            >
              {generating ? (
                <><RefreshCw size={14} className="animate-spin" /> Generating design...</>
              ) : (
                <><Sparkles size={14} /> Generate Design</>
              )}
            </Button>

            {generating && (
              <div className="text-center">
                <p className="text-xs text-muted-foreground tracking-wide animate-pulse">
                  AI is rendering your interior design...
                </p>
                <p className="text-[10px] text-muted-foreground/60 mt-1">This may take 30–60 seconds</p>
              </div>
            )}
          </div>

          {/* Right: Image Output */}
          <Card className="bg-card border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm tracking-wide font-semibold">Generated Design</CardTitle>
            </CardHeader>
            <CardContent>
              {imageBase64 ? (
                <div className="space-y-4">
                  <div className="rounded-xl overflow-hidden border border-border">
                    <img
                      src={`data:image/jpeg;base64,${imageBase64}`}
                      alt="AI generated interior design"
                      className="w-full"
                    />
                  </div>
                  <div className="flex gap-3">
                    <Button
                      onClick={handleDownload}
                      variant="outline"
                      size="sm"
                      className="flex-1 text-xs tracking-wide border-border gap-2"
                    >
                      <Download size={14} /> Download
                    </Button>
                    <Button
                      onClick={handleGenerate}
                      disabled={generating}
                      variant="outline"
                      size="sm"
                      className="flex-1 text-xs tracking-wide border-primary/30 text-primary hover:bg-primary/10 gap-2"
                    >
                      <RefreshCw size={14} className={generating ? "animate-spin" : ""} />
                      Regenerate
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="aspect-square flex flex-col items-center justify-center bg-muted/30 rounded-xl border border-dashed border-border">
                  <div className="w-16 h-16 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mb-4">
                    <Sparkles size={28} className="text-primary/60" />
                  </div>
                  <p className="text-sm text-muted-foreground font-medium">No design generated yet</p>
                  <p className="text-xs text-muted-foreground/60 mt-1 text-center max-w-48">
                    Enter a prompt and click Generate Design
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Tips */}
        <Card className="mt-6 bg-card border-border">
          <CardContent className="pt-5">
            <p className="text-xs tracking-[0.2em] uppercase text-muted-foreground mb-3">Prompt Tips</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { tip: "Include room type", example: '"living room", "master bedroom", "home office"' },
                { tip: "Specify style", example: '"minimalist", "art deco", "industrial luxe", "Japandi"' },
                { tip: "Describe materials", example: '"marble floors", "walnut panelling", "brushed brass"' },
              ].map(({ tip, example }) => (
                <div key={tip} className="bg-muted/40 rounded-lg p-3">
                  <p className="text-xs font-semibold text-foreground mb-1">{tip}</p>
                  <p className="text-[10px] text-muted-foreground italic">{example}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
