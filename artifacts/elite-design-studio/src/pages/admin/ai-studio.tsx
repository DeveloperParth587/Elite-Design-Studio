import { useState, useEffect, useRef, useCallback } from "react";
import {
  Sparkles, Download, Wand2, RefreshCw, LayoutGrid, Image, Clapperboard,
  CheckCircle2, Loader2, Play, Pause, Share2, Copy, Mail, Check, X
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

interface Slide { label: string; b64_json: string; mimeType: string; }
interface WalkthroughFrame { room: string; b64_json: string; mimeType: string; }

// ---------- Share Modal ----------
interface ShareModalProps {
  type: "walkthrough" | "slideshow";
  prompt: string;
  frames: (WalkthroughFrame | Slide)[];
  onClose: () => void;
}

function ShareModal({ type, prompt, frames, onClose }: ShareModalProps) {
  const [creating, setCreating] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [title, setTitle] = useState<string>("");
  const [copied, setCopied] = useState(false);
  const [clientEmail, setClientEmail] = useState("");
  const { toast } = useToast();

  const shareUrl = token
    ? `${window.location.origin}${import.meta.env.BASE_URL.replace(/\/$/, "")}/share/${token}`
    : null;

  const handleCreate = async () => {
    setCreating(true);
    try {
      const res = await fetch("/api/shares", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, title, prompt, frames }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed");
      setToken(data.token);
      setTitle(data.title);
      toast({ title: "Share link created!" });
    } catch (err) {
      toast({ title: "Failed to create link", description: err instanceof Error ? err.message : "", variant: "destructive" });
    } finally {
      setCreating(false);
    }
  };

  const handleCopy = async () => {
    if (!shareUrl) return;
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleGmail = () => {
    if (!shareUrl) return;
    const to = clientEmail.trim();
    const subject = encodeURIComponent(`Your Exclusive Interior Design Preview — Elite Design Studio`);
    const body = encodeURIComponent(
      `Dear ${to ? "Valued Client" : "Client"},\n\nWe are delighted to share your personalised interior design concept, crafted exclusively for you by Elite Design Studio.\n\nView your design preview here:\n${shareUrl}\n\nThis preview showcases ${frames.length} ${type === "walkthrough" ? "rooms of your interior walkthrough" : "design perspectives"}, created based on your brief:\n"${prompt.slice(0, 120)}${prompt.length > 120 ? "..." : ""}"\n\nWe would love to discuss how we can bring this vision to life. Book a consultation at your convenience:\n${window.location.origin}/consultation\n\nWarm regards,\nElite Design Studio\nTransforming spaces into experiences`
    );
    const toParam = to ? `&to=${encodeURIComponent(to)}` : "";
    window.open(`https://mail.google.com/mail/?view=cm&fs=1${toParam}&su=${subject}&body=${body}`, "_blank");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="bg-card border border-border rounded-2xl w-full max-w-md shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-border">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
              <Share2 size={15} className="text-primary" />
            </div>
            <div>
              <h2 className="text-sm font-semibold">Share with Client</h2>
              <p className="text-[10px] text-muted-foreground capitalize">{type} · {frames.length} {type === "walkthrough" ? "rooms" : "perspectives"}</p>
            </div>
          </div>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
            <X size={15} />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {!token ? (
            <>
              <div className="space-y-1.5">
                <Label className="text-xs">Share Title (optional)</Label>
                <input
                  type="text"
                  placeholder={`${type === "walkthrough" ? "Interior Walkthrough" : "Design Concept"} — ${new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short" })}`}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary/50"
                />
              </div>
              <div className="bg-muted/30 border border-border rounded-lg p-3 space-y-1">
                <p className="text-[10px] tracking-[0.15em] uppercase text-muted-foreground font-medium">What will be shared</p>
                <p className="text-xs text-foreground">
                  A branded public page with your {type === "walkthrough" ? "5-room interior walkthrough" : "3-perspective design concept"} — no login needed for clients.
                </p>
              </div>
              <Button onClick={handleCreate} disabled={creating} className="w-full bg-primary text-primary-foreground hover:bg-primary/90 text-xs tracking-[0.15em] uppercase gap-2">
                {creating ? <><Loader2 size={13} className="animate-spin" /> Creating link...</> : <><Share2 size={13} /> Create Share Link</>}
              </Button>
            </>
          ) : (
            <>
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Share Link</Label>
                <div className="flex gap-2">
                  <div className="flex-1 px-3 py-2 text-xs bg-muted/40 border border-border rounded-lg truncate text-foreground font-mono select-all">
                    {shareUrl}
                  </div>
                  <Button onClick={handleCopy} variant="outline" size="sm" className="shrink-0 border-border gap-1.5 text-xs">
                    {copied ? <><Check size={12} className="text-green-500" /> Copied!</> : <><Copy size={12} /> Copy</>}
                  </Button>
                </div>
              </div>

              <div className="border-t border-border pt-4 space-y-2">
                <Label className="text-xs text-muted-foreground">Send via Gmail</Label>
                <input
                  type="email"
                  placeholder="client@example.com (optional)"
                  value={clientEmail}
                  onChange={(e) => setClientEmail(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary/50"
                />
                <Button onClick={handleGmail} className="w-full bg-[#EA4335] hover:bg-[#d33b2c] text-white text-xs tracking-[0.12em] uppercase gap-2 font-medium">
                  <Mail size={13} />
                  Open Gmail Compose
                </Button>
                <p className="text-[10px] text-muted-foreground text-center">
                  Opens Gmail with a pre-written luxury branded email containing your share link
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ---------- Ken Burns canvas renderer ----------
const FRAME_DURATION = 3800;
const CROSSFADE_DURATION = 700;
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

function drawFrame(ctx: CanvasRenderingContext2D, img: HTMLImageElement, progress: number, alpha: number, label: string, labelAlpha: number) {
  const scale = 1 + progress * 0.07;
  const panX = (progress - 0.5) * 30;
  const panY = (0.5 - progress) * 18;
  ctx.save();
  ctx.globalAlpha = alpha;
  const sw = VIDEO_W / scale;
  const sh = VIDEO_H / scale;
  const sx = (img.naturalWidth - sw * (img.naturalWidth / VIDEO_W)) / 2 + panX;
  const sy = (img.naturalHeight - sh * (img.naturalHeight / VIDEO_H)) / 2 + panY;
  ctx.drawImage(img, Math.max(0, sx), Math.max(0, sy), img.naturalWidth - Math.max(0, sx) * 2, img.naturalHeight - Math.max(0, sy) * 2, 0, 0, VIDEO_W, VIDEO_H);
  if (labelAlpha > 0) {
    ctx.globalAlpha = alpha * labelAlpha;
    const padX = 20, padY = 10, fontSize = 22;
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

async function renderWalkthroughVideo(frames: WalkthroughFrame[], onProgress: (pct: number) => void): Promise<Blob> {
  const canvas = document.createElement("canvas");
  canvas.width = VIDEO_W; canvas.height = VIDEO_H;
  const ctx = canvas.getContext("2d")!;
  const images = await Promise.all(frames.map((f) => loadImage(`data:${f.mimeType};base64,${f.b64_json}`)));
  const stream = canvas.captureStream(FPS);
  const mimeType = MediaRecorder.isTypeSupported("video/webm;codecs=vp9") ? "video/webm;codecs=vp9" : "video/webm";
  const recorder = new MediaRecorder(stream, { mimeType, videoBitsPerSecond: 4_000_000 });
  const chunks: Blob[] = [];
  recorder.ondataavailable = (e) => { if (e.data.size > 0) chunks.push(e.data); };
  const done = new Promise<void>((res) => { recorder.onstop = () => res(); });
  recorder.start(100);
  const totalDuration = frames.length * FRAME_DURATION;
  const startTime = performance.now();
  await new Promise<void>((resolve) => {
    function tick() {
      const elapsed = performance.now() - startTime;
      onProgress(Math.min(100, (elapsed / totalDuration) * 100));
      ctx.clearRect(0, 0, VIDEO_W, VIDEO_H);
      const fi = Math.floor(elapsed / FRAME_DURATION);
      const fe = elapsed - fi * FRAME_DURATION;
      const fp = fe / FRAME_DURATION;
      if (fi >= frames.length) { drawFrame(ctx, images[images.length - 1], 1, 1, frames[frames.length - 1].room, 0); recorder.stop(); resolve(); return; }
      const csStart = FRAME_DURATION - CROSSFADE_DURATION;
      if (fe > csStart && fi + 1 < frames.length) {
        const cfp = (fe - csStart) / CROSSFADE_DURATION;
        drawFrame(ctx, images[fi], fp, 1 - cfp, frames[fi].room, Math.max(0, 1 - cfp * 3));
        drawFrame(ctx, images[fi + 1], 0, cfp, frames[fi + 1].room, 0);
      } else {
        const lf = fe < 600 ? fe / 600 : fe > csStart - 400 ? Math.max(0, 1 - (fe - (csStart - 400)) / 400) : 1;
        drawFrame(ctx, images[fi], fp, 1, frames[fi].room, lf);
      }
      requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  });
  await done;
  return new Blob(chunks, { type: "video/webm" });
}

// ---------- Main Component ----------
export default function AIStudio() {
  const [tab, setTab] = useState<Tab>("image");

  // Image
  const [prompt, setPrompt] = useState("");
  const [enhancedPrompt, setEnhancedPrompt] = useState("");
  const [imageBase64, setImageBase64] = useState("");
  const [imageMime, setImageMime] = useState("image/png");
  const [useEnhanced, setUseEnhanced] = useState(true);

  // Slideshow
  const [slideshowPrompt, setSlideshowPrompt] = useState("");
  const [slides, setSlides] = useState<Slide[]>([]);
  const [activeSlide, setActiveSlide] = useState(0);
  const [generatingSlideshow, setGeneratingSlideshow] = useState(false);
  const [slideshowProgress, setSlideshowProgress] = useState(0);
  const slideshowIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Walkthrough
  const [walkthroughPrompt, setWalkthroughPrompt] = useState("");
  const [walkthroughFrames, setWalkthroughFrames] = useState<WalkthroughFrame[]>([]);
  const [generatingFrames, setGeneratingFrames] = useState(false);
  const [renderingVideo, setRenderingVideo] = useState(false);
  const [renderProgress, setRenderProgress] = useState(0);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [videoPlaying, setVideoPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const prevVideoUrl = useRef<string | null>(null);

  // Share modal
  const [shareModal, setShareModal] = useState<{ type: "walkthrough" | "slideshow"; prompt: string; frames: (WalkthroughFrame | Slide)[] } | null>(null);

  const { toast } = useToast();
  const { mutateAsync: enhancePrompt, isPending: enhancing } = useEnhancePrompt();
  const { mutateAsync: generateImage, isPending: generating } = useGenerateImage();

  useEffect(() => {
    if (slides.length < 2) return;
    slideshowIntervalRef.current = setInterval(() => setActiveSlide((p) => (p + 1) % slides.length), 4000);
    return () => { if (slideshowIntervalRef.current) clearInterval(slideshowIntervalRef.current); };
  }, [slides]);

  useEffect(() => { return () => { if (prevVideoUrl.current) URL.revokeObjectURL(prevVideoUrl.current); }; }, []);

  const handleEnhance = async () => {
    if (!prompt.trim()) return;
    try {
      const result = await enhancePrompt({ data: { prompt } });
      setEnhancedPrompt(result.enhanced ?? "");
      toast({ title: "Prompt enhanced successfully" });
    } catch { toast({ title: "Enhancement failed", variant: "destructive" }); }
  };

  const handleGenerate = async () => {
    const fp = (useEnhanced && enhancedPrompt) ? enhancedPrompt : prompt;
    if (!fp.trim()) { toast({ title: "Enter a prompt first", variant: "destructive" }); return; }
    try {
      const result = await generateImage({ data: { prompt: fp, enhance: false } });
      setImageBase64(result.imageBase64);
      if ((result as { mimeType?: string }).mimeType) setImageMime((result as { mimeType?: string }).mimeType!);
      if (result.enhancedPrompt) setEnhancedPrompt(result.enhancedPrompt);
      toast({ title: "Image generated successfully" });
    } catch (err) { toast({ title: "Generation failed", description: err instanceof Error ? err.message : "", variant: "destructive" }); }
  };

  const handleDownloadImage = () => {
    if (!imageBase64) return;
    const ext = imageMime.split("/")[1] ?? "png";
    const a = document.createElement("a"); a.href = `data:${imageMime};base64,${imageBase64}`; a.download = `elite-design-ai.${ext}`; a.click();
  };

  const handleGenerateSlideshow = async () => {
    if (!slideshowPrompt.trim()) { toast({ title: "Enter a prompt first", variant: "destructive" }); return; }
    setGeneratingSlideshow(true); setSlides([]); setActiveSlide(0); setSlideshowProgress(0);
    const ticker = setInterval(() => setSlideshowProgress((p) => Math.min(p + 3, 90)), 1500);
    try {
      const res = await fetch("/api/ai/generate-slideshow", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ prompt: slideshowPrompt }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSlideshowProgress(100); setSlides(data.slides ?? []);
      toast({ title: "Concept slideshow ready" });
    } catch (err) { toast({ title: "Failed", description: err instanceof Error ? err.message : "", variant: "destructive" }); }
    finally { clearInterval(ticker); setGeneratingSlideshow(false); }
  };

  const handleDownloadSlide = (slide: Slide, i: number) => {
    const ext = slide.mimeType.split("/")[1] ?? "png"; const a = document.createElement("a");
    a.href = `data:${slide.mimeType};base64,${slide.b64_json}`; a.download = `elite-${slide.label.toLowerCase()}-${i + 1}.${ext}`; a.click();
  };

  const handleGenerateWalkthrough = async () => {
    if (!walkthroughPrompt.trim()) { toast({ title: "Enter a prompt first", variant: "destructive" }); return; }
    setGeneratingFrames(true); setWalkthroughFrames([]); setVideoUrl(null);
    try {
      const res = await fetch("/api/ai/generate-walkthrough", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ prompt: walkthroughPrompt }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setWalkthroughFrames(data.frames ?? []);
      toast({ title: "Room images ready", description: "Click Render Video to generate the walkthrough" });
    } catch (err) { toast({ title: "Failed", description: err instanceof Error ? err.message : "", variant: "destructive" }); }
    finally { setGeneratingFrames(false); }
  };

  const handleRenderVideo = useCallback(async () => {
    if (!walkthroughFrames.length) return;
    setRenderingVideo(true); setRenderProgress(0);
    try {
      const blob = await renderWalkthroughVideo(walkthroughFrames, setRenderProgress);
      if (prevVideoUrl.current) URL.revokeObjectURL(prevVideoUrl.current);
      const url = URL.createObjectURL(blob); prevVideoUrl.current = url; setVideoUrl(url);
      toast({ title: "Walkthrough video ready!" });
    } catch (err) { toast({ title: "Render failed", description: err instanceof Error ? err.message : "", variant: "destructive" }); }
    finally { setRenderingVideo(false); }
  }, [walkthroughFrames, toast]);

  const handleDownloadVideo = () => {
    if (!videoUrl) return;
    const a = document.createElement("a"); a.href = videoUrl; a.download = "elite-design-walkthrough.webm"; a.click();
  };

  const ROOMS = ["Entrance Foyer", "Living Room", "Kitchen & Dining", "Master Bedroom", "Bathroom"];

  return (
    <AdminLayout>
      {shareModal && (
        <ShareModal
          type={shareModal.type}
          prompt={shareModal.prompt}
          frames={shareModal.frames}
          onClose={() => setShareModal(null)}
        />
      )}

      <div className="p-4 sm:p-6 max-w-6xl mx-auto">
        <div className="mb-6">
          <p className="text-xs tracking-[0.25em] uppercase text-primary mb-1">Admin</p>
          <h1 className="text-xl sm:text-2xl font-bold flex items-center gap-2"><Sparkles size={20} className="text-primary" /> AI Design Studio</h1>
          <p className="text-muted-foreground text-sm mt-1">Generate photorealistic images, concept slideshows, and cinematic interior walkthroughs.</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-muted/40 p-1 rounded-lg w-fit flex-wrap">
          {([
            { id: "image", label: "Image Generation", icon: <Image size={14} /> },
            { id: "slideshow", label: "Concept Slideshow", icon: <LayoutGrid size={14} /> },
            { id: "walkthrough", label: "Interior Walkthrough", icon: <Clapperboard size={14} /> },
          ] as { id: Tab; label: string; icon: React.ReactNode }[]).map(({ id, label, icon }) => (
            <button key={id} onClick={() => setTab(id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-xs font-medium tracking-wide transition-colors ${tab === id ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>
              {icon} {label}
            </button>
          ))}
        </div>

        {/* IMAGE TAB */}
        {tab === "image" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <div className="space-y-4">
              <Card className="bg-card border-border">
                <CardHeader className="pb-3"><CardTitle className="text-sm font-semibold">Your Prompt</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  <Textarea placeholder="e.g. A minimalist living room with marble floors, floor-to-ceiling windows..." value={prompt} onChange={(e) => setPrompt(e.target.value)} rows={4} className="bg-background border-border resize-none text-sm" />
                  <Button onClick={handleEnhance} disabled={enhancing || !prompt.trim()} variant="outline" className="w-full text-xs tracking-[0.15em] uppercase border-primary/30 text-primary hover:bg-primary/10 gap-2">
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
                      <Label htmlFor="use-enhanced" className="text-xs text-muted-foreground cursor-pointer">Use enhanced prompt</Label>
                    </div>
                  </CardContent>
                </Card>
              )}
              <Button onClick={handleGenerate} disabled={generating || !prompt.trim()} className="w-full bg-primary text-primary-foreground hover:bg-primary/90 text-xs tracking-[0.2em] uppercase font-medium py-5 gap-2">
                {generating ? <><RefreshCw size={13} className="animate-spin" /> Generating...</> : <><Sparkles size={13} /> Generate Design</>}
              </Button>
              {generating && <div className="text-center"><div className="w-full bg-muted rounded-full h-1 overflow-hidden"><div className="h-full bg-primary/60 animate-pulse w-3/4 rounded-full" /></div><p className="text-xs text-muted-foreground mt-2 animate-pulse">AI is rendering...</p></div>}
              <Card className="bg-card border-border">
                <CardContent className="pt-4">
                  <p className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground mb-3">Prompt Tips</p>
                  <div className="space-y-2">
                    {[["Room type", '"living room", "master bedroom"'], ["Style", '"minimalist", "Japandi", "art deco"'], ["Materials", '"marble floors", "walnut panelling"']].map(([tip, ex]) => (
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
                    <div className="rounded-xl overflow-hidden border border-border"><img src={`data:${imageMime};base64,${imageBase64}`} alt="AI generated interior" className="w-full" /></div>
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
                  <Textarea placeholder="e.g. A luxury penthouse living room with panoramic city views, warm walnut wood and marble..." value={slideshowPrompt} onChange={(e) => setSlideshowPrompt(e.target.value)} rows={5} className="bg-background border-border resize-none text-sm" />
                  <p className="text-[10px] text-muted-foreground">Generates <strong className="text-foreground">3 perspectives</strong>: Overview, Detail, and Mood.</p>
                </CardContent>
              </Card>
              <Button onClick={handleGenerateSlideshow} disabled={generatingSlideshow || !slideshowPrompt.trim()} className="w-full bg-primary text-primary-foreground hover:bg-primary/90 text-xs tracking-[0.2em] uppercase font-medium py-5 gap-2">
                {generatingSlideshow ? <><RefreshCw size={13} className="animate-spin" /> Generating 3 concepts...</> : <><LayoutGrid size={13} /> Generate Concept Slideshow</>}
              </Button>
              {generatingSlideshow && (
                <div className="text-center space-y-2">
                  <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden"><div className="h-full bg-primary rounded-full transition-all duration-[1500ms]" style={{ width: `${slideshowProgress}%` }} /></div>
                  <p className="text-xs text-muted-foreground animate-pulse">Generating 3 design perspectives...</p>
                </div>
              )}
              {slides.length > 0 && (
                <>
                  <Card className="bg-card border-border">
                    <CardContent className="pt-4">
                      <p className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground mb-3">All Perspectives</p>
                      <div className="grid grid-cols-3 gap-2">
                        {slides.map((slide, i) => (
                          <button key={i} onClick={() => setActiveSlide(i)} className={`relative rounded-lg overflow-hidden border-2 transition-colors ${activeSlide === i ? "border-primary" : "border-border hover:border-primary/40"}`}>
                            <img src={`data:${slide.mimeType};base64,${slide.b64_json}`} alt={slide.label} className="w-full aspect-video object-cover" />
                            <div className="absolute bottom-0 inset-x-0 bg-black/60 text-[8px] text-white text-center py-0.5 font-medium tracking-wide">{slide.label}</div>
                          </button>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                  <Button onClick={() => setShareModal({ type: "slideshow", prompt: slideshowPrompt, frames: slides })}
                    variant="outline" className="w-full text-xs tracking-[0.15em] uppercase gap-2 border-primary/30 text-primary hover:bg-primary/10">
                    <Share2 size={13} /> Share with Client
                  </Button>
                </>
              )}
            </div>
            <Card className="bg-card border-border">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-semibold">Design Concept Slideshow</CardTitle>
                  {slides.length > 0 && (
                    <div className="flex gap-1">
                      {slides.map((_, i) => (<button key={i} onClick={() => setActiveSlide(i)} className={`rounded-full transition-all ${activeSlide === i ? "w-4 h-2 bg-primary" : "w-2 h-2 bg-muted-foreground/30 hover:bg-muted-foreground/60"}`} />))}
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
                          <div className="absolute top-3 left-3"><Badge className="text-[9px] tracking-[0.12em] uppercase bg-black/60 text-white border-0 backdrop-blur-sm">{slide.label}</Badge></div>
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={() => handleDownloadSlide(slides[activeSlide], activeSlide)} variant="outline" size="sm" className="flex-1 text-xs gap-1.5 border-border"><Download size={13} /> Download {slides[activeSlide]?.label}</Button>
                      <Button onClick={handleGenerateSlideshow} disabled={generatingSlideshow} variant="outline" size="sm" className="flex-1 text-xs gap-1.5 border-primary/30 text-primary hover:bg-primary/10"><RefreshCw size={13} className={generatingSlideshow ? "animate-spin" : ""} /> Regenerate</Button>
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
                <CardHeader className="pb-3"><CardTitle className="text-sm font-semibold">House Description</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  <Textarea placeholder="e.g. A modern luxury villa with Japandi aesthetics — warm oak wood, Calacatta marble, minimal clutter..." value={walkthroughPrompt} onChange={(e) => setWalkthroughPrompt(e.target.value)} rows={5} className="bg-background border-border resize-none text-sm" />
                  <p className="text-[10px] text-muted-foreground">AI generates <strong className="text-foreground">5 rooms</strong> then renders a cinematic walkthrough video with pan &amp; zoom effects.</p>
                </CardContent>
              </Card>

              <Card className="bg-card border-border">
                <CardContent className="pt-4">
                  <p className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground mb-3">Rooms in Walkthrough</p>
                  <div className="space-y-1.5">
                    {ROOMS.map((room, i) => {
                      const frame = walkthroughFrames[i];
                      return (
                        <div key={room} className="flex items-center gap-2.5 bg-muted/30 rounded-lg px-3 py-2">
                          {frame ? <CheckCircle2 size={13} className="text-green-500 shrink-0" /> : generatingFrames ? <Loader2 size={13} className="text-primary animate-spin shrink-0" /> : <div className="w-3 h-3 rounded-full border border-muted-foreground/30 shrink-0" />}
                          <span className="text-xs text-foreground">{room}</span>
                          {frame && <img src={`data:${frame.mimeType};base64,${frame.b64_json}`} alt={room} className="ml-auto w-10 h-7 object-cover rounded border border-border" />}
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              <Button onClick={handleGenerateWalkthrough} disabled={generatingFrames || renderingVideo || !walkthroughPrompt.trim()} className="w-full bg-primary text-primary-foreground hover:bg-primary/90 text-xs tracking-[0.2em] uppercase font-medium py-5 gap-2">
                {generatingFrames ? <><Loader2 size={13} className="animate-spin" /> Generating 5 rooms (60–120s)...</> : <><Sparkles size={13} /> Step 1: Generate Room Images</>}
              </Button>

              {walkthroughFrames.length > 0 && (
                <Button onClick={handleRenderVideo} disabled={renderingVideo} variant="outline" className="w-full text-xs tracking-[0.2em] uppercase font-medium py-5 gap-2 border-primary/40 text-primary hover:bg-primary/10">
                  {renderingVideo ? <><Loader2 size={13} className="animate-spin" /> Rendering ({Math.round(renderProgress)}%)...</> : <><Clapperboard size={13} /> Step 2: Render Walkthrough Video</>}
                </Button>
              )}

              {renderingVideo && (
                <div className="space-y-1.5">
                  <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden"><div className="h-full bg-primary rounded-full transition-all" style={{ width: `${renderProgress}%` }} /></div>
                  <p className="text-xs text-muted-foreground text-center animate-pulse">Rendering cinematic walkthrough...</p>
                </div>
              )}

              {walkthroughFrames.length > 0 && (
                <Button onClick={() => setShareModal({ type: "walkthrough", prompt: walkthroughPrompt, frames: walkthroughFrames })}
                  variant="outline" className="w-full text-xs tracking-[0.15em] uppercase gap-2 border-primary/30 text-primary hover:bg-primary/10">
                  <Share2 size={13} /> Share with Client
                </Button>
              )}
            </div>

            <Card className="bg-card border-border">
              <CardHeader className="pb-3"><CardTitle className="text-sm font-semibold">Walkthrough Video</CardTitle></CardHeader>
              <CardContent>
                {videoUrl ? (
                  <div className="space-y-3">
                    <div className="rounded-xl overflow-hidden border border-border bg-black">
                      <video ref={videoRef} src={videoUrl} controls autoPlay loop muted className="w-full"
                        onPlay={() => setVideoPlaying(true)} onPause={() => setVideoPlaying(false)} />
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={() => { videoRef.current?.paused ? videoRef.current?.play() : videoRef.current?.pause(); }} variant="outline" size="sm" className="gap-1.5 text-xs border-border">
                        {videoPlaying ? <><Pause size={13} /> Pause</> : <><Play size={13} /> Play</>}
                      </Button>
                      <Button onClick={handleDownloadVideo} variant="outline" size="sm" className="flex-1 text-xs gap-1.5 border-primary/30 text-primary hover:bg-primary/10">
                        <Download size={13} /> Download WebM
                      </Button>
                    </div>
                    <p className="text-[10px] text-muted-foreground text-center">~{Math.round((ROOMS.length * FRAME_DURATION) / 1000)}s · 1280×720 · WebM</p>
                  </div>
                ) : (
                  <div className="aspect-video flex flex-col items-center justify-center bg-muted/20 rounded-xl border border-dashed border-border">
                    <div className="w-16 h-16 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mb-3"><Clapperboard size={28} className="text-primary/50" /></div>
                    <p className="text-sm text-muted-foreground font-medium">No walkthrough yet</p>
                    <p className="text-xs text-muted-foreground/60 mt-1 text-center max-w-48 leading-relaxed">Describe your house, generate room images, then render the video</p>
                    {walkthroughFrames.length > 0 && !videoUrl && (
                      <div className="mt-4 grid grid-cols-5 gap-1">
                        {walkthroughFrames.map((f, i) => (<img key={i} src={`data:${f.mimeType};base64,${f.b64_json}`} alt={f.room} className="w-full aspect-video object-cover rounded border border-primary/30" />))}
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
