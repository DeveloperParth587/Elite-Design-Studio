import { useState, useEffect, useRef } from "react";
import { Sparkles, Download, Wand2, RefreshCw, LayoutGrid, Image } from "lucide-react";
import AdminLayout from "@/components/layout/admin-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useEnhancePrompt, useGenerateImage } from "@workspace/api-client-react";

type Tab = "image" | "slideshow";

interface Slide {
  label: string;
  b64_json: string;
  mimeType: string;
}

export default function AIStudio() {
  const [tab, setTab] = useState<Tab>("image");

  // Image generation state
  const [prompt, setPrompt] = useState("");
  const [enhancedPrompt, setEnhancedPrompt] = useState("");
  const [imageBase64, setImageBase64] = useState("");
  const [imageMime, setImageMime] = useState("image/png");
  const [useEnhanced, setUseEnhanced] = useState(true);

  // Slideshow state
  const [slideshowPrompt, setSlideshowPrompt] = useState("");
  const [slides, setSlides] = useState<Slide[]>([]);
  const [activeSlide, setActiveSlide] = useState(0);
  const [generatingSlideshow, setGeneratingSlideshow] = useState(false);
  const [slideshowProgress, setSlideshowProgress] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const { toast } = useToast();
  const { mutateAsync: enhancePrompt, isPending: enhancing } = useEnhancePrompt();
  const { mutateAsync: generateImage, isPending: generating } = useGenerateImage();

  // Auto-advance slideshow
  useEffect(() => {
    if (slides.length < 2) return;
    intervalRef.current = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % slides.length);
    }, 4000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [slides]);

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
      if ((result as { mimeType?: string }).mimeType) setImageMime((result as { mimeType?: string }).mimeType!);
      if (result.enhancedPrompt) setEnhancedPrompt(result.enhancedPrompt);
      toast({ title: "Image generated successfully" });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Generation failed";
      toast({ title: "Generation failed", description: msg, variant: "destructive" });
    }
  };

  const handleDownloadImage = () => {
    if (!imageBase64) return;
    const ext = imageMime.split("/")[1] ?? "png";
    const link = document.createElement("a");
    link.href = `data:${imageMime};base64,${imageBase64}`;
    link.download = `elite-design-studio-ai.${ext}`;
    link.click();
  };

  const handleGenerateSlideshow = async () => {
    if (!slideshowPrompt.trim()) {
      toast({ title: "Enter a prompt first", variant: "destructive" });
      return;
    }
    setGeneratingSlideshow(true);
    setSlides([]);
    setActiveSlide(0);
    setSlideshowProgress(0);

    // Fake progress ticks while waiting
    const ticker = setInterval(() => {
      setSlideshowProgress((p) => Math.min(p + 3, 90));
    }, 1500);

    try {
      const res = await fetch("/api/ai/generate-slideshow", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: slideshowPrompt }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Slideshow generation failed");
      setSlideshowProgress(100);
      setSlides(data.slides ?? []);
      toast({ title: "Design concept slideshow ready", description: "3 perspectives generated" });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Generation failed";
      toast({ title: "Generation failed", description: msg, variant: "destructive" });
    } finally {
      clearInterval(ticker);
      setGeneratingSlideshow(false);
    }
  };

  const handleDownloadSlide = (slide: Slide, index: number) => {
    const ext = slide.mimeType.split("/")[1] ?? "png";
    const link = document.createElement("a");
    link.href = `data:${slide.mimeType};base64,${slide.b64_json}`;
    link.download = `elite-design-${slide.label.toLowerCase()}-${index + 1}.${ext}`;
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
            Generate photorealistic interior design images and multi-perspective concept slideshows with AI.
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
            onClick={() => setTab("slideshow")}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-xs font-medium tracking-wide transition-colors ${tab === "slideshow" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
          >
            <LayoutGrid size={14} /> Concept Slideshow
          </button>
        </div>

        {/* IMAGE TAB */}
        {tab === "image" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <div className="space-y-4">
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
                  <p className="text-xs text-muted-foreground mt-2 animate-pulse">AI is rendering your interior design...</p>
                </div>
              )}

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

            <Card className="bg-card border-border">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold">Generated Design</CardTitle>
              </CardHeader>
              <CardContent>
                {imageBase64 ? (
                  <div className="space-y-3">
                    <div className="rounded-xl overflow-hidden border border-border">
                      <img src={`data:${imageMime};base64,${imageBase64}`} alt="AI generated interior" className="w-full" />
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

        {/* SLIDESHOW TAB */}
        {tab === "slideshow" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <div className="space-y-4">
              <Card className="bg-card border-border">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold">Design Concept</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Textarea
                    placeholder="e.g. A luxury penthouse living room with panoramic city views, warm walnut wood and marble..."
                    value={slideshowPrompt}
                    onChange={(e) => setSlideshowPrompt(e.target.value)}
                    rows={5}
                    className="bg-background border-border resize-none text-sm"
                  />
                  <p className="text-[10px] text-muted-foreground leading-relaxed">
                    Generates <strong className="text-foreground">3 perspectives</strong>: Overview, Detail, and Mood — each automatically tailored by AI.
                  </p>
                </CardContent>
              </Card>

              <Button
                onClick={handleGenerateSlideshow}
                disabled={generatingSlideshow || !slideshowPrompt.trim()}
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90 text-xs tracking-[0.2em] uppercase font-medium py-5 gap-2"
              >
                {generatingSlideshow
                  ? <><RefreshCw size={13} className="animate-spin" /> Generating 3 concepts...</>
                  : <><LayoutGrid size={13} /> Generate Concept Slideshow</>}
              </Button>

              {generatingSlideshow && (
                <div className="text-center space-y-2">
                  <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full transition-all duration-[1500ms]"
                      style={{ width: `${slideshowProgress}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground animate-pulse">
                    Generating 3 design perspectives — takes 60–90 seconds...
                  </p>
                </div>
              )}

              {slides.length > 0 && (
                <Card className="bg-card border-border">
                  <CardContent className="pt-4">
                    <p className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground mb-3">All Perspectives</p>
                    <div className="grid grid-cols-3 gap-2">
                      {slides.map((slide, i) => (
                        <button
                          key={i}
                          onClick={() => setActiveSlide(i)}
                          className={`relative rounded-lg overflow-hidden border-2 transition-colors ${activeSlide === i ? "border-primary" : "border-border hover:border-primary/40"}`}
                        >
                          <img
                            src={`data:${slide.mimeType};base64,${slide.b64_json}`}
                            alt={slide.label}
                            className="w-full aspect-video object-cover"
                          />
                          <div className="absolute bottom-0 inset-x-0 bg-black/60 text-[8px] text-white text-center py-0.5 font-medium tracking-wide">
                            {slide.label}
                          </div>
                        </button>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              <Card className="bg-card border-border">
                <CardContent className="pt-4">
                  <p className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground mb-3">Perspective Guide</p>
                  <div className="space-y-2">
                    {[
                      { tip: "Overview", example: "Full-room wide shot — shows layout and overall atmosphere" },
                      { tip: "Detail", example: "Close-up materials, textures, finishes, fixtures" },
                      { tip: "Mood", example: "Evening/dusk lighting for cinematic emotional impact" },
                    ].map(({ tip, example }) => (
                      <div key={tip} className="bg-muted/40 rounded-lg px-3 py-2 flex gap-2 items-start">
                        <p className="text-xs font-semibold text-foreground shrink-0 min-w-[52px]">{tip}:</p>
                        <p className="text-[10px] text-muted-foreground">{example}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Slideshow output */}
            <Card className="bg-card border-border">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-semibold">Design Concept Slideshow</CardTitle>
                  {slides.length > 0 && (
                    <div className="flex gap-1">
                      {slides.map((_, i) => (
                        <button
                          key={i}
                          onClick={() => setActiveSlide(i)}
                          className={`rounded-full transition-all ${activeSlide === i ? "w-4 h-2 bg-primary" : "w-2 h-2 bg-muted-foreground/30 hover:bg-muted-foreground/60"}`}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {slides.length > 0 ? (
                  <div className="space-y-3">
                    <div className="relative rounded-xl overflow-hidden border border-border bg-black">
                      {slides.map((slide, i) => (
                        <div
                          key={i}
                          className={`transition-opacity duration-700 ${i === activeSlide ? "opacity-100" : "opacity-0 absolute inset-0"}`}
                        >
                          <img
                            src={`data:${slide.mimeType};base64,${slide.b64_json}`}
                            alt={slide.label}
                            className="w-full"
                          />
                          <div className="absolute top-3 left-3">
                            <Badge className="text-[9px] tracking-[0.12em] uppercase bg-black/60 text-white border-0 backdrop-blur-sm">
                              {slide.label}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      <Button
                        onClick={() => handleDownloadSlide(slides[activeSlide], activeSlide)}
                        variant="outline"
                        size="sm"
                        className="flex-1 text-xs gap-1.5 border-border"
                      >
                        <Download size={13} /> Download {slides[activeSlide]?.label}
                      </Button>
                      <Button
                        onClick={handleGenerateSlideshow}
                        disabled={generatingSlideshow}
                        variant="outline"
                        size="sm"
                        className="flex-1 text-xs gap-1.5 border-primary/30 text-primary hover:bg-primary/10"
                      >
                        <RefreshCw size={13} className={generatingSlideshow ? "animate-spin" : ""} /> Regenerate
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="aspect-video flex flex-col items-center justify-center bg-muted/20 rounded-xl border border-dashed border-border">
                    <div className="w-14 h-14 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mb-3">
                      <LayoutGrid size={24} className="text-primary/50" />
                    </div>
                    <p className="text-sm text-muted-foreground font-medium">No slideshow generated yet</p>
                    <p className="text-xs text-muted-foreground/60 mt-1 text-center max-w-44">
                      Enter a design concept and click Generate
                    </p>
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
