import { useState } from "react";
import { Sparkles, Download, Wand2, RefreshCw, Video, Image } from "lucide-react";
import AdminLayout from "@/components/layout/admin-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useEnhancePrompt, useGenerateImage } from "@workspace/api-client-react";

type Tab = "image" | "video";

export default function AIStudio() {
  const [tab, setTab] = useState<Tab>("image");

  // Image generation state
  const [prompt, setPrompt] = useState("");
  const [enhancedPrompt, setEnhancedPrompt] = useState("");
  const [imageBase64, setImageBase64] = useState("");
  const [useEnhanced, setUseEnhanced] = useState(true);

  // Video generation state
  const [videoPrompt, setVideoPrompt] = useState("");
  const [videoBase64, setVideoBase64] = useState("");
  const [videoMime, setVideoMime] = useState("video/mp4");
  const [generatingVideo, setGeneratingVideo] = useState(false);

  const { toast } = useToast();
  const { mutateAsync: enhancePrompt, isPending: enhancing } = useEnhancePrompt();
  const { mutateAsync: generateImage, isPending: generating } = useGenerateImage();

  const handleEnhance = async () => {
    if (!prompt.trim()) return;
    try {
      const result = await enhancePrompt({ data: { prompt } });
      setEnhancedPrompt(result.enhanced ?? "");
      toast({ title: "Prompt enhanced successfully" });
    } catch {
      toast({ title: "Enhancement failed", description: "Check your API connection and retry", variant: "destructive" });
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
      toast({ title: "Image generated successfully" });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Generation failed";
      toast({ title: "Generation failed", description: msg, variant: "destructive" });
    }
  };

  const handleDownloadImage = () => {
    if (!imageBase64) return;
    const link = document.createElement("a");
    link.href = `data:image/jpeg;base64,${imageBase64}`;
    link.download = "elite-design-studio-ai.jpg";
    link.click();
  };

  const handleGenerateVideo = async () => {
    if (!videoPrompt.trim()) {
      toast({ title: "Enter a prompt first", variant: "destructive" });
      return;
    }
    setGeneratingVideo(true);
    try {
      const res = await fetch("/api/ai/generate-video", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: videoPrompt }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Video generation failed");
      setVideoBase64(data.videoBase64);
      setVideoMime(data.contentType ?? "video/mp4");
      toast({ title: "Video generated successfully" });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Video generation failed";
      toast({ title: "Generation failed", description: msg, variant: "destructive" });
    } finally {
      setGeneratingVideo(false);
    }
  };

  const handleDownloadVideo = () => {
    if (!videoBase64) return;
    const link = document.createElement("a");
    link.href = `data:${videoMime};base64,${videoBase64}`;
    link.download = "elite-design-studio-video.mp4";
    link.click();
  };

  return (
    <AdminLayout>
      <div className="p-4 sm:p-6 max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <p className="text-xs tracking-[0.25em] uppercase text-primary mb-1">Admin</p>
          <h1 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
            <Sparkles size={20} className="text-primary" />
            AI Design Studio
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Generate photorealistic interior design images and cinematic concept videos with AI.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-muted/40 p-1 rounded-lg w-fit">
          <button
            onClick={() => setTab("image")}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-xs font-medium tracking-wide transition-colors ${tab === "image" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
          >
            <Image size={14} /> Image Generation
          </button>
          <button
            onClick={() => setTab("video")}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-xs font-medium tracking-wide transition-colors ${tab === "video" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
          >
            <Video size={14} /> Video Generation
          </button>
        </div>

        {/* IMAGE TAB */}
        {tab === "image" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <div className="space-y-4">
              {/* Input */}
              <Card className="bg-card border-border">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm tracking-wide font-semibold">Your Prompt</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Textarea
                    placeholder="e.g. A minimalist living room with marble floors, floor-to-ceiling windows..."
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
                    {enhancing ? <><RefreshCw size={13} className="animate-spin" /> Enhancing...</> : <><Wand2 size={13} /> Enhance with AI</>}
                  </Button>
                </CardContent>
              </Card>

              {/* Enhanced prompt result */}
              {enhancedPrompt && (
                <Card className="bg-card border-primary/25 border">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-semibold">Enhanced Prompt</CardTitle>
                      <Badge variant="outline" className="text-[9px] tracking-[0.1em] uppercase border-primary/30 text-primary">AI Enhanced</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-xs text-muted-foreground leading-relaxed bg-muted/60 p-3 rounded-lg border border-border">
                      {enhancedPrompt}
                    </p>
                    <div className="flex items-center gap-2">
                      <input type="checkbox" id="use-enhanced" checked={useEnhanced} onChange={(e) => setUseEnhanced(e.target.checked)} className="accent-primary" />
                      <Label htmlFor="use-enhanced" className="text-xs text-muted-foreground cursor-pointer">Use enhanced prompt for generation</Label>
                    </div>
                  </CardContent>
                </Card>
              )}

              <Button
                onClick={handleGenerate}
                disabled={generating || !prompt.trim()}
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90 text-xs tracking-[0.2em] uppercase font-medium py-5 gap-2"
              >
                {generating ? <><RefreshCw size={13} className="animate-spin" /> Generating (30–90s)...</> : <><Sparkles size={13} /> Generate Design</>}
              </Button>

              {generating && (
                <div className="text-center">
                  <div className="w-full bg-muted rounded-full h-1 overflow-hidden">
                    <div className="h-full bg-primary/60 animate-pulse w-3/4 rounded-full" />
                  </div>
                  <p className="text-xs text-muted-foreground mt-2 animate-pulse">AI is rendering your interior design... this may take 30–90 seconds</p>
                </div>
              )}

              {/* Prompt tips */}
              <Card className="bg-card border-border">
                <CardContent className="pt-4">
                  <p className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground mb-3">Prompt Tips</p>
                  <div className="space-y-2">
                    {[
                      { tip: "Room type", example: '"living room", "master bedroom", "home office"' },
                      { tip: "Style", example: '"minimalist", "art deco", "industrial luxe", "Japandi"' },
                      { tip: "Materials", example: '"marble floors", "walnut panelling", "brushed brass"' },
                    ].map(({ tip, example }) => (
                      <div key={tip} className="bg-muted/40 rounded-lg px-3 py-2 flex gap-2 items-start">
                        <p className="text-xs font-semibold text-foreground shrink-0">{tip}:</p>
                        <p className="text-[10px] text-muted-foreground italic">{example}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Image output */}
            <Card className="bg-card border-border">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold">Generated Design</CardTitle>
              </CardHeader>
              <CardContent>
                {imageBase64 ? (
                  <div className="space-y-3">
                    <div className="rounded-xl overflow-hidden border border-border">
                      <img src={`data:image/jpeg;base64,${imageBase64}`} alt="AI generated interior" className="w-full" />
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={handleDownloadImage} variant="outline" size="sm" className="flex-1 text-xs gap-1.5 border-border">
                        <Download size={13} /> Download
                      </Button>
                      <Button onClick={handleGenerate} disabled={generating} variant="outline" size="sm" className="flex-1 text-xs gap-1.5 border-primary/30 text-primary hover:bg-primary/10">
                        <RefreshCw size={13} className={generating ? "animate-spin" : ""} /> Regenerate
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="aspect-square flex flex-col items-center justify-center bg-muted/20 rounded-xl border border-dashed border-border">
                    <div className="w-14 h-14 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mb-3">
                      <Image size={24} className="text-primary/50" />
                    </div>
                    <p className="text-sm text-muted-foreground font-medium">No design generated yet</p>
                    <p className="text-xs text-muted-foreground/60 mt-1 text-center max-w-40">Enter a prompt and click Generate Design</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* VIDEO TAB */}
        {tab === "video" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <div className="space-y-4">
              <Card className="bg-card border-border">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold">Video Prompt</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Textarea
                    placeholder="e.g. A luxury penthouse living room with panoramic city views, golden hour lighting..."
                    value={videoPrompt}
                    onChange={(e) => setVideoPrompt(e.target.value)}
                    rows={5}
                    className="bg-background border-border resize-none text-sm"
                  />
                  <p className="text-[10px] text-muted-foreground">
                    The AI will automatically add cinematic interior design terms to your prompt.
                  </p>
                </CardContent>
              </Card>

              <Button
                onClick={handleGenerateVideo}
                disabled={generatingVideo || !videoPrompt.trim()}
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90 text-xs tracking-[0.2em] uppercase font-medium py-5 gap-2"
              >
                {generatingVideo ? <><RefreshCw size={13} className="animate-spin" /> Generating video (60–120s)...</> : <><Video size={13} /> Generate Design Video</>}
              </Button>

              {generatingVideo && (
                <div className="text-center">
                  <div className="w-full bg-muted rounded-full h-1 overflow-hidden">
                    <div className="h-full bg-primary/60 animate-pulse w-1/2 rounded-full" />
                  </div>
                  <p className="text-xs text-muted-foreground mt-2 animate-pulse">Rendering cinematic design video — this takes 60–120 seconds...</p>
                </div>
              )}

              <Card className="bg-card border-border">
                <CardContent className="pt-4">
                  <p className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground mb-3">Video Tips</p>
                  <div className="space-y-2">
                    {[
                      { tip: "Camera motion", example: '"slow pan through", "camera dolly forward"' },
                      { tip: "Lighting", example: '"golden hour", "dramatic spotlighting", "candlelit"' },
                      { tip: "Atmosphere", example: '"serene", "opulent", "minimalist calm"' },
                    ].map(({ tip, example }) => (
                      <div key={tip} className="bg-muted/40 rounded-lg px-3 py-2 flex gap-2 items-start">
                        <p className="text-xs font-semibold text-foreground shrink-0">{tip}:</p>
                        <p className="text-[10px] text-muted-foreground italic">{example}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Video output */}
            <Card className="bg-card border-border">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold">Generated Video</CardTitle>
              </CardHeader>
              <CardContent>
                {videoBase64 ? (
                  <div className="space-y-3">
                    <div className="rounded-xl overflow-hidden border border-border bg-black">
                      <video
                        src={`data:${videoMime};base64,${videoBase64}`}
                        controls
                        autoPlay
                        loop
                        muted
                        className="w-full"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={handleDownloadVideo} variant="outline" size="sm" className="flex-1 text-xs gap-1.5 border-border">
                        <Download size={13} /> Download MP4
                      </Button>
                      <Button onClick={handleGenerateVideo} disabled={generatingVideo} variant="outline" size="sm" className="flex-1 text-xs gap-1.5 border-primary/30 text-primary hover:bg-primary/10">
                        <RefreshCw size={13} className={generatingVideo ? "animate-spin" : ""} /> Regenerate
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="aspect-video flex flex-col items-center justify-center bg-muted/20 rounded-xl border border-dashed border-border">
                    <div className="w-14 h-14 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mb-3">
                      <Video size={24} className="text-primary/50" />
                    </div>
                    <p className="text-sm text-muted-foreground font-medium">No video generated yet</p>
                    <p className="text-xs text-muted-foreground/60 mt-1 text-center max-w-44">Enter a prompt and click Generate Design Video</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
