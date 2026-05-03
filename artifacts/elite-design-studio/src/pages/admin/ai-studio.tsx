import { useState, useEffect, useRef, useCallback } from "react";
import {
  Sparkles, Download, Wand2, RefreshCw, LayoutGrid, Image, Clapperboard,
  CheckCircle2, Loader2, Play, Pause
} from "lucide-react";
import AdminLayout from "@/components/layout/admin-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useEnhancePrompt, useGenerateImage } from "@workspace/api-client-react";

type Tab = "image" | "slideshow" | "walkthrough";

interface Slide {
  label: string;
  b64_json: string;
  mimeType: string;
}

interface WalkthroughFrame {
  room: string;
  b64_json: string;
  mimeType: string;
}

// ----- Ken Burns canvas video renderer -----
const FRAME_DURATION = 3800; // ms each room shown
const CROSSFADE_DURATION = 700; // ms fade between rooms
const VIDEO_W = 1280;
const VIDEO_H = 720;
const FPS = 30;

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

function drawFrame(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  progress: number, // 0..1 within this room's display time
  alpha: number,
  label: string,
  labelAlpha: number
) {
  const scale = 1 + progress * 0.07;
  const panX = (progress - 0.5) * 30;
  const panY = (0.5 - progress) * 18;

  ctx.save();
  ctx.globalAlpha = alpha;

  // Draw image with Ken Burns transform
  const sw = VIDEO_W / scale;
  const sh = VIDEO_H / scale;
  const sx = (img.naturalWidth - sw * (img.naturalWidth / VIDEO_W)) / 2 + panX;
  const sy = (img.naturalHeight - sh * (img.naturalHeight / VIDEO_H)) / 2 + panY;

  ctx.drawImage(
    img,
    Math.max(0, sx), Math.max(0, sy),
    img.naturalWidth - Math.max(0, sx) * 2,
    img.naturalHeight - Math.max(0, sy) * 2,
    0, 0, VIDEO_W, VIDEO_H
  );

  // Room label
  if (labelAlpha > 0) {
    ctx.globalAlpha = alpha * labelAlpha;
    // Background pill
    const padX = 20, padY = 10;
    const fontSize = 22;
    ctx.font = `600 ${fontSize}px Inter, system-ui, sans-serif`;
    const tw = ctx.measureText(label).width;
    const rx = 40, ry = VIDEO_H - 72;
    ctx.fillStyle = "rgba(0,0,0,0.55)";
    ctx.beginPath();
    ctx.roundRect(rx, ry, tw + padX * 2, fontSize + padY * 2, 8);
    ctx.fill();
    ctx.fillStyle = "rgba(255,255,255,0.95)";
    ctx.fillText(label, rx + padX, ry + fontSize + padY - 4);
  }

  ctx.restore();
}

async function renderWalkthroughVideo(
  frames: WalkthroughFrame[],
  onProgress: (pct: number) => void
): Promise<Blob> {
  const canvas = document.createElement("canvas");
  canvas.width = VIDEO_W;
  canvas.height = VIDEO_H;
  const ctx = canvas.getContext("2d")!;

  // Load all images
  const images = await Promise.all(
    frames.map((f) => loadImage(`data:${f.mimeType};base64,${f.b64_json}`))
  );

  const stream = canvas.captureStream(FPS);
  const mimeType = MediaRecorder.isTypeSupported("video/webm;codecs=vp9")
    ? "video/webm;codecs=vp9"
    : "video/webm";
  const recorder = new MediaRecorder(stream, { mimeType, videoBitsPerSecond: 4_000_000 });
  const chunks: Blob[] = [];
  recorder.ondataavailable = (e) => { if (e.data.size > 0) chunks.push(e.data); };

  const recordingDone = new Promise<void>((res) => { recorder.onstop = () => res(); });
  recorder.start(100);

  const totalDuration = frames.length * FRAME_DURATION;
  const startTime = performance.now();

  await new Promise<void>((resolve) => {
    function tick() {
      const now = performance.now();
      const elapsed = now - startTime;
      onProgress(Math.min(100, (elapsed / totalDuration) * 100));

      ctx.clearRect(0, 0, VIDEO_W, VIDEO_H);

      const frameIndex = Math.floor(elapsed / FRAME_DURATION);
      const frameElapsed = elapsed - frameIndex * FRAME_DURATION;
      const frameProgress = frameElapsed / FRAME_DURATION;

      if (frameIndex >= frames.length) {
        // Hold last frame briefly
        drawFrame(ctx, images[images.length - 1], 1, 1, frames[frames.length - 1].room, 0);
        recorder.stop();
        resolve();
        return;
      }

      const crossfadeStart = FRAME_DURATION - CROSSFADE_DURATION;
      const inCrossfade = frameElapsed > crossfadeStart;

      if (inCrossfade && frameIndex + 1 < frames.length) {
        const cfProg = (frameElapsed - crossfadeStart) / CROSSFADE_DURATION;
        // Draw current fading out
        drawFrame(ctx, images[frameIndex], frameProgress, 1 - cfProg, frames[frameIndex].room, Math.max(0, 1 - cfProg * 3));
        // Draw next fading in
        drawFrame(ctx, images[frameIndex + 1], 0, cfProg, frames[frameIndex + 1].room, 0);
      } else {
        const labelFade = frameElapsed < 600 ? frameElapsed / 600 : frameElapsed > crossfadeStart - 400 ? Math.max(0, 1 - (frameElapsed - (crossfadeStart - 400)) / 400) : 1;
        drawFrame(ctx, images[frameIndex], frameProgress, 1, frames[frameIndex].room, labelFade);
      }

      requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  });

  await recordingDone;
  return new Blob(chunks, { type: "video/webm" });
}

export default function AIStudio() {
  const [tab, setTab] = useState<Tab>("image");

  // Image state
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
  const slideshowIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Walkthrough state
  const [walkthroughPrompt, setWalkthroughPrompt] = useState("");
  const [walkthroughFrames, setWalkthroughFrames] = useState<WalkthroughFrame[]>([]);
  const [generatingFrames, setGeneratingFrames] = useState(false);
  const [renderingVideo, setRenderingVideo] = useState(false);
  const [renderProgress, setRenderProgress] = useState(0);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [videoPlaying, setVideoPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const prevVideoUrl = useRef<string | null>(null);

  const { toast } = useToast();
  const { mutateAsync: enhancePrompt, isPending: enhancing } = useEnhancePrompt();
  const { mutateAsync: generateImage, isPending: generating } = useGenerateImage();

  // Auto-advance slideshow
  useEffect(() => {
    if (slides.length < 2) return;
    slideshowIntervalRef.current = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % slides.length);
    }, 4000);
    return () => { if (slideshowIntervalRef.current) clearInterval(slideshowIntervalRef.current); };
  }, [slides]);

  // Revoke old blob URL
  useEffect(() => {
    return () => { if (prevVideoUrl.current) URL.revokeObjectURL(prevVideoUrl.current); };
  }, []);

  const handleEnhance = async () => {
    if (!prompt.trim()) return;
    try {
      const result = await enhancePrompt({ data: { prompt } });
      setEnhancedPrompt(result.enhanced ?? "");
      toast({ title: "Prompt enhanced successfully" });
    } catch {
      toast({ title: "Enhancement failed", variant: "destructive" });
    }
  };

  const handleGenerate = async () => {
    const finalPrompt = (useEnhanced && enhancedPrompt) ? enhancedPrompt : prompt;
    if (!finalPrompt.trim()) { toast({ title: "Enter a prompt first", variant: "destructive" }); return; }
    try {
      const result = await generateImage({ data: { prompt: finalPrompt, enhance: false } });
      setImageBase64(result.imageBase64);
      if ((result as { mimeType?: string }).mimeType) setImageMime((result as { mimeType?: string }).mimeType!);
      if (result.enhancedPrompt) setEnhancedPrompt(result.enhancedPrompt);
      toast({ title: "Image generated successfully" });
    } catch (err) {
      toast({ title: "Generation failed", description: err instanceof Error ? err.message : "Retry", variant: "destructive" });
    }
  };

  const handleDownloadImage = () => {
    if (!imageBase64) return;
    const ext = imageMime.split("/")[1] ?? "png";
    const link = document.createElement("a");
    link.href = `data:${imageMime};base64,${imageBase64}`;
    link.download = `elite-design-ai.${ext}`;
    link.click();
  };

  const handleGenerateSlideshow = async () => {
    if (!slideshowPrompt.trim()) { toast({ title: "Enter a prompt first", variant: "destructive" }); return; }
    setGeneratingSlideshow(true);
    setSlides([]);
    setActiveSlide(0);
    setSlideshowProgress(0);
    const ticker = setInterval(() => setSlideshowProgress((p) => Math.min(p + 3, 90)), 1500);
    try {
      const res = await fetch("/api/ai/generate-slideshow", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: slideshowPrompt }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed");
      setSlideshowProgress(100);
      setSlides(data.slides ?? []);
      toast({ title: "Concept slideshow ready", description: "3 perspectives generated" });
    } catch (err) {
      toast({ title: "Generation failed", description: err instanceof Error ? err.message : "", variant: "destructive" });
    } finally {
      clearInterval(ticker);
      setGeneratingSlideshow(false);
    }
  };

  const handleDownloadSlide = (slide: Slide, i: number) => {
    const ext = slide.mimeType.split("/")[1] ?? "png";
    const link = document.createElement("a");
    link.href = `data:${slide.mimeType};base64,${slide.b64_json}`;
    link.download = `elite-design-${slide.label.toLowerCase()}-${i + 1}.${ext}`;
    link.click();
  };

  const handleGenerateWalkthrough = async () => {
    if (!walkthroughPrompt.trim()) { toast({ title: "Enter a prompt first", variant: "destructive" }); return; }
    setGeneratingFrames(true);
    setWalkthroughFrames([]);
    setVideoUrl(null);
    setRenderProgress(0);
    try {
      const res = await fetch("/api/ai/generate-walkthrough", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: walkthroughPrompt }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed");
      setWalkthroughFrames(data.frames ?? []);
      toast({ title: "Room images ready", description: "Click Render Video to generate the walkthrough" });
    } catch (err) {
      toast({ title: "Generation failed", description: err instanceof Error ? err.message : "", variant: "destructive" });
    } finally {
      setGeneratingFrames(false);
    }
  };

  const handleRenderVideo = useCallback(async () => {
    if (!walkthroughFrames.length) return;
    setRenderingVideo(true);
    setRenderProgress(0);
    try {
      const blob = await renderWalkthroughVideo(walkthroughFrames, setRenderProgress);
      if (prevVideoUrl.current) URL.revokeObjectURL(prevVideoUrl.current);
      const url = URL.createObjectURL(blob);
      prevVideoUrl.current = url;
      setVideoUrl(url);
      toast({ title: "Walkthrough video ready!", description: "Play or download your interior tour" });
    } catch (err) {
      toast({ title: "Render failed", description: err instanceof Error ? err.message : "", variant: "destructive" });
    } finally {
      setRenderingVideo(false);
    }
  }, [walkthroughFrames, toast]);

  const handleDownloadVideo = () => {
    if (!videoUrl) return;
    const link = document.createElement("a");
    link.href = videoUrl;
    link.download = "elite-design-walkthrough.webm";
    link.click();
  };

  const ROOMS = ["Entrance Foyer", "Living Room", "Kitchen & Dining", "Master Bedroom", "Bathroom"];

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
            Generate photorealistic images, concept slideshows, and cinematic interior walkthroughs.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-muted/40 p-1 rounded-lg w-fit flex-wrap">
          {([
            { id: "image", label: "Image Generation", icon: <Image size={14} /> },
            { id: "slideshow", label: "Concept Slideshow", icon: <LayoutGrid size={14} /> },
            { id: "walkthrough", label: "Interior Walkthrough", icon: <Clapperboard size={14} /> },
          ] as { id: Tab; label: string; icon: React.ReactNode }[]).map(({ id, label, icon }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-xs font-medium tracking-wide transition-colors ${tab === id ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
            >
              {icon} {label}
            </button>
          ))}
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
                  <Button onClick={handleEnhance} disabled={enhancing || !prompt.trim()} variant="outline"
                    className="w-full text-xs tracking-[0.15em] uppercase border-primary/30 text-primary hover:bg-primary/10 gap-2">
                    {enhancing ? <><RefreshCw size={13} className="animate-spin" /> Enhancing...</> : <><Wand2 size={13} /> Enhance with AI</>}
                  </Button>
                </CardContent>
              </Card>

              {enhancedPrompt && (
                <Card className="bg-card border-primary/25">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-semibold">Enhanced Prompt</CardTitle>
                      <Badge variant="outline" className="text-[9px] tracking-[0.1em] uppercase border-primary/30 text-primary">AI Enhanced</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-xs text-muted-foreground leading-relaxed bg-muted/60 p-3 rounded-lg border border-border">{enhancedPrompt}</p>
                    <div className="flex items-center gap-2">
                      <input type="checkbox" id="use-enhanced" checked={useEnhanced} onChange={(e) => setUseEnhanced(e.target.checked)} className="accent-primary" />
                      <Label htmlFor="use-enhanced" className="text-xs text-muted-foreground cursor-pointer">Use enhanced prompt for generation</Label>
                    </div>
                  </CardContent>
                </Card>
              )}

              <Button onClick={handleGenerate} disabled={generating || !prompt.trim()}
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90 text-xs tracking-[0.2em] uppercase font-medium py-5 gap-2">
                {generating ? <><RefreshCw size={13} className="animate-spin" /> Generating...</> : <><Sparkles size={13} /> Generate Design</>}
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
                    {[["Room type", '"living room", "master bedroom"'],["Style", '"minimalist", "Japandi", "art deco"'],["Materials", '"marble floors", "walnut panelling"']].map(([tip, ex]) => (
                      <div key={tip} className="bg-muted/40 rounded-lg px-3 py-2 flex gap-2 items-start">
                        <p className="text-xs font-semibold shrink-0">{tip}:</p>
                        <p className="text-[10px] text-muted-foreground italic">{ex}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-card border-border">
              <CardHeader className="pb-3"><CardTitle className="text-sm font-semibold">Generated Design</CardTitle></CardHeader>
              <CardContent>
                {imageBase64 ? (
                  <div className="space-y-3">
                    <div className="rounded-xl overflow-hidden border border-border">
                      <img src={`data:${imageMime};base64,${imageBase64}`} alt="AI generated interior" className="w-full" />
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={handleDownloadImage} variant="outline" size="sm" className="flex-1 text-xs gap-1.5 border-border"><Download size={13} /> Download</Button>
                      <Button onClick={handleGenerate} disabled={generating} variant="outline" size="sm" className="flex-1 text-xs gap-1.5 border-primary/30 text-primary hover:bg-primary/10"><RefreshCw size={13} className={generating ? "animate-spin" : ""} /> Regenerate</Button>
                    </div>
                  </div>
                ) : (
                  <div className="aspect-square flex flex-col items-center justify-center bg-muted/20 rounded-xl border border-dashed border-border">
                    <div className="w-14 h-14 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mb-3"><Image size={24} className="text-primary/50" /></div>
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
                <CardHeader className="pb-3"><CardTitle className="text-sm font-semibold">Design Concept</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  <Textarea placeholder="e.g. A luxury penthouse living room with panoramic city views, warm walnut wood and marble..."
                    value={slideshowPrompt} onChange={(e) => setSlideshowPrompt(e.target.value)}
                    rows={5} className="bg-background border-border resize-none text-sm" />
                  <p className="text-[10px] text-muted-foreground leading-relaxed">
                    Generates <strong className="text-foreground">3 perspectives</strong>: Overview, Detail, and Mood.
                  </p>
                </CardContent>
              </Card>

              <Button onClick={handleGenerateSlideshow} disabled={generatingSlideshow || !slideshowPrompt.trim()}
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90 text-xs tracking-[0.2em] uppercase font-medium py-5 gap-2">
                {generatingSlideshow ? <><RefreshCw size={13} className="animate-spin" /> Generating 3 concepts...</> : <><LayoutGrid size={13} /> Generate Concept Slideshow</>}
              </Button>

              {generatingSlideshow && (
                <div className="text-center space-y-2">
                  <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
                    <div className="h-full bg-primary rounded-full transition-all duration-[1500ms]" style={{ width: `${slideshowProgress}%` }} />
                  </div>
                  <p className="text-xs text-muted-foreground animate-pulse">Generating 3 design perspectives...</p>
                </div>
              )}

              {slides.length > 0 && (
                <Card className="bg-card border-border">
                  <CardContent className="pt-4">
                    <p className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground mb-3">All Perspectives</p>
                    <div className="grid grid-cols-3 gap-2">
                      {slides.map((slide, i) => (
                        <button key={i} onClick={() => setActiveSlide(i)}
                          className={`relative rounded-lg overflow-hidden border-2 transition-colors ${activeSlide === i ? "border-primary" : "border-border hover:border-primary/40"}`}>
                          <img src={`data:${slide.mimeType};base64,${slide.b64_json}`} alt={slide.label} className="w-full aspect-video object-cover" />
                          <div className="absolute bottom-0 inset-x-0 bg-black/60 text-[8px] text-white text-center py-0.5 font-medium tracking-wide">{slide.label}</div>
                        </button>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            <Card className="bg-card border-border">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-semibold">Design Concept Slideshow</CardTitle>
                  {slides.length > 0 && (
                    <div className="flex gap-1">
                      {slides.map((_, i) => (
                        <button key={i} onClick={() => setActiveSlide(i)}
                          className={`rounded-full transition-all ${activeSlide === i ? "w-4 h-2 bg-primary" : "w-2 h-2 bg-muted-foreground/30 hover:bg-muted-foreground/60"}`} />
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
                        <div key={i} className={`transition-opacity duration-700 ${i === activeSlide ? "opacity-100" : "opacity-0 absolute inset-0"}`}>
                          <img src={`data:${slide.mimeType};base64,${slide.b64_json}`} alt={slide.label} className="w-full" />
                          <div className="absolute top-3 left-3">
                            <Badge className="text-[9px] tracking-[0.12em] uppercase bg-black/60 text-white border-0 backdrop-blur-sm">{slide.label}</Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={() => handleDownloadSlide(slides[activeSlide], activeSlide)} variant="outline" size="sm" className="flex-1 text-xs gap-1.5 border-border">
                        <Download size={13} /> Download {slides[activeSlide]?.label}
                      </Button>
                      <Button onClick={handleGenerateSlideshow} disabled={generatingSlideshow} variant="outline" size="sm" className="flex-1 text-xs gap-1.5 border-primary/30 text-primary hover:bg-primary/10">
                        <RefreshCw size={13} className={generatingSlideshow ? "animate-spin" : ""} /> Regenerate
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="aspect-video flex flex-col items-center justify-center bg-muted/20 rounded-xl border border-dashed border-border">
                    <div className="w-14 h-14 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mb-3"><LayoutGrid size={24} className="text-primary/50" /></div>
                    <p className="text-sm text-muted-foreground font-medium">No slideshow generated yet</p>
                    <p className="text-xs text-muted-foreground/60 mt-1 text-center max-w-44">Enter a concept and click Generate</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* WALKTHROUGH TAB */}
        {tab === "walkthrough" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <div className="space-y-4">
              <Card className="bg-card border-border">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold">House Description</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Textarea
                    placeholder="e.g. A modern luxury villa with Japandi aesthetics — warm oak wood, Calacatta marble, minimal clutter, curated art pieces, large glass walls..."
                    value={walkthroughPrompt}
                    onChange={(e) => setWalkthroughPrompt(e.target.value)}
                    rows={5}
                    className="bg-background border-border resize-none text-sm"
                  />
                  <p className="text-[10px] text-muted-foreground leading-relaxed">
                    AI will generate <strong className="text-foreground">5 rooms</strong> of your house then render a cinematic walkthrough video with pan &amp; zoom effects.
                  </p>
                </CardContent>
              </Card>

              {/* Rooms that will be generated */}
              <Card className="bg-card border-border">
                <CardContent className="pt-4">
                  <p className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground mb-3">Rooms in Walkthrough</p>
                  <div className="space-y-1.5">
                    {ROOMS.map((room, i) => {
                      const frame = walkthroughFrames[i];
                      return (
                        <div key={room} className="flex items-center gap-2.5 bg-muted/30 rounded-lg px-3 py-2">
                          {frame ? (
                            <CheckCircle2 size={13} className="text-green-500 shrink-0" />
                          ) : generatingFrames ? (
                            <Loader2 size={13} className="text-primary animate-spin shrink-0" />
                          ) : (
                            <div className="w-3 h-3 rounded-full border border-muted-foreground/30 shrink-0" />
                          )}
                          <span className="text-xs text-foreground">{room}</span>
                          {frame && (
                            <img src={`data:${frame.mimeType};base64,${frame.b64_json}`} alt={room}
                              className="ml-auto w-10 h-7 object-cover rounded border border-border" />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Step 1 */}
              <Button onClick={handleGenerateWalkthrough} disabled={generatingFrames || renderingVideo || !walkthroughPrompt.trim()}
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90 text-xs tracking-[0.2em] uppercase font-medium py-5 gap-2">
                {generatingFrames
                  ? <><Loader2 size={13} className="animate-spin" /> Generating 5 rooms (60–120s)...</>
                  : <><Sparkles size={13} /> Step 1: Generate Room Images</>}
              </Button>

              {/* Step 2 */}
              {walkthroughFrames.length > 0 && (
                <Button onClick={handleRenderVideo} disabled={renderingVideo}
                  variant="outline"
                  className="w-full text-xs tracking-[0.2em] uppercase font-medium py-5 gap-2 border-primary/40 text-primary hover:bg-primary/10">
                  {renderingVideo
                    ? <><Loader2 size={13} className="animate-spin" /> Rendering video ({Math.round(renderProgress)}%)...</>
                    : <><Clapperboard size={13} /> Step 2: Render Walkthrough Video</>}
                </Button>
              )}

              {renderingVideo && (
                <div className="space-y-1.5">
                  <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
                    <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${renderProgress}%` }} />
                  </div>
                  <p className="text-xs text-muted-foreground text-center animate-pulse">Rendering cinematic walkthrough with pan &amp; zoom effects...</p>
                </div>
              )}
            </div>

            {/* Video Output */}
            <Card className="bg-card border-border">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold">Walkthrough Video</CardTitle>
              </CardHeader>
              <CardContent>
                {videoUrl ? (
                  <div className="space-y-3">
                    <div className="rounded-xl overflow-hidden border border-border bg-black">
                      <video
                        ref={videoRef}
                        src={videoUrl}
                        controls
                        autoPlay
                        loop
                        muted
                        className="w-full"
                        onPlay={() => setVideoPlaying(true)}
                        onPause={() => setVideoPlaying(false)}
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={() => { videoRef.current?.paused ? videoRef.current?.play() : videoRef.current?.pause(); }}
                        variant="outline" size="sm" className="gap-1.5 text-xs border-border">
                        {videoPlaying ? <><Pause size={13} /> Pause</> : <><Play size={13} /> Play</>}
                      </Button>
                      <Button onClick={handleDownloadVideo} variant="outline" size="sm" className="flex-1 text-xs gap-1.5 border-primary/30 text-primary hover:bg-primary/10">
                        <Download size={13} /> Download WebM
                      </Button>
                    </div>
                    <p className="text-[10px] text-muted-foreground text-center">
                      ~{Math.round((ROOMS.length * FRAME_DURATION) / 1000)}s cinematic walkthrough · 1280×720 · WebM
                    </p>
                  </div>
                ) : (
                  <div className="aspect-video flex flex-col items-center justify-center bg-muted/20 rounded-xl border border-dashed border-border">
                    <div className="w-16 h-16 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mb-3">
                      <Clapperboard size={28} className="text-primary/50" />
                    </div>
                    <p className="text-sm text-muted-foreground font-medium">No walkthrough yet</p>
                    <p className="text-xs text-muted-foreground/60 mt-1 text-center max-w-48 leading-relaxed">
                      Describe your house, generate room images, then render the video
                    </p>
                    {walkthroughFrames.length > 0 && !videoUrl && (
                      <div className="mt-4 grid grid-cols-5 gap-1">
                        {walkthroughFrames.map((f, i) => (
                          <img key={i} src={`data:${f.mimeType};base64,${f.b64_json}`} alt={f.room}
                            className="w-full aspect-video object-cover rounded border border-primary/30" />
                        ))}
                      </div>
                    )}
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
