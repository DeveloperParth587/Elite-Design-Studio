import { useState, useEffect, useRef } from "react";
import { useParams, Link } from "wouter";
import { Calendar, ArrowRight, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface Frame {
  room?: string;
  label?: string;
  b64_json: string;
  mimeType: string;
}

interface ShareData {
  token: string;
  type: string;
  title: string;
  prompt: string;
  frames: Frame[];
  createdAt: string;
}

export default function SharePage() {
  const { token } = useParams<{ token: string }>();
  const [share, setShare] = useState<ShareData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!token) return;
    fetch(`/api/shares/${token}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) setError(data.error);
        else setShare(data);
      })
      .catch(() => setError("Failed to load design preview"))
      .finally(() => setLoading(false));
  }, [token]);

  useEffect(() => {
    if (!share || share.frames.length < 2 || !isPlaying) return;
    intervalRef.current = setInterval(() => {
      setActiveIndex((p) => (p + 1) % share.frames.length);
    }, 4500);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [share, isPlaying]);

  const navigate = (dir: number) => {
    if (!share) return;
    setIsPlaying(false);
    setActiveIndex((p) => (p + dir + share.frames.length) % share.frames.length);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center">
        <div className="text-center space-y-3">
          <Loader2 size={32} className="text-[#c8a96e] animate-spin mx-auto" />
          <p className="text-[#8b7355] text-sm tracking-widest uppercase">Loading your design preview</p>
        </div>
      </div>
    );
  }

  if (error || !share) {
    return (
      <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center">
        <div className="text-center space-y-4 px-6">
          <div className="w-16 h-16 rounded-sm bg-[#c8a96e]/10 border border-[#c8a96e]/20 flex items-center justify-center mx-auto mb-2">
            <span className="text-lg font-bold tracking-widest text-[#c8a96e]">EDS</span>
          </div>
          <p className="text-[#f5f0e8] text-lg font-medium">Design preview not found</p>
          <p className="text-[#8b7355] text-sm">This link may have expired or is invalid.</p>
          <Link href="/">
            <Button variant="outline" className="border-[#c8a96e]/40 text-[#c8a96e] hover:bg-[#c8a96e]/10 mt-2">
              Visit Elite Design Studio
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const active = share.frames[activeIndex];
  const frameLabel = active?.room ?? active?.label ?? `Frame ${activeIndex + 1}`;
  const isWalkthrough = share.type === "walkthrough";

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-[#f5f0e8]">
      {/* Header */}
      <header className="border-b border-[#2a2a2a] px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <Link href="/">
            <div className="flex items-center gap-3 cursor-pointer group">
              <div className="w-9 h-9 rounded-sm bg-[#c8a96e]/15 border border-[#c8a96e]/30 flex items-center justify-center">
                <span className="text-xs font-bold tracking-widest text-[#c8a96e]">EDS</span>
              </div>
              <div>
                <p className="text-xs font-semibold tracking-[0.2em] uppercase text-[#f5f0e8]">Elite Design Studio</p>
                <p className="text-[10px] tracking-widest uppercase text-[#8b7355]">Luxury Interior Design</p>
              </div>
            </div>
          </Link>
          <Link href="/consultation">
            <Button size="sm" className="bg-[#c8a96e] hover:bg-[#b8995e] text-[#1a1a1a] text-xs tracking-[0.12em] uppercase gap-1.5 font-semibold">
              Book Consultation <ArrowRight size={12} />
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero */}
      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="mb-6">
          <Badge className="mb-3 text-[9px] tracking-[0.2em] uppercase bg-[#c8a96e]/10 text-[#c8a96e] border border-[#c8a96e]/20 rounded-sm">
            {isWalkthrough ? "Interior Walkthrough" : "Design Concept"}
          </Badge>
          <h1 className="text-2xl sm:text-3xl font-light tracking-wide text-[#f5f0e8] mb-2">{share.title}</h1>
          <div className="flex items-center gap-2 text-[#8b7355] text-xs">
            <Calendar size={12} />
            <span>{new Date(share.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</span>
            <span className="mx-1">·</span>
            <span>{share.frames.length} {isWalkthrough ? "rooms" : "perspectives"}</span>
          </div>
        </div>

        {/* Main viewer */}
        <div className="relative rounded-xl overflow-hidden border border-[#2a2a2a] bg-black mb-4 group">
          {share.frames.map((frame, i) => (
            <div
              key={i}
              className={`transition-opacity duration-700 ${i === activeIndex ? "opacity-100" : "opacity-0 absolute inset-0"}`}
            >
              <img
                src={`data:${frame.mimeType};base64,${frame.b64_json}`}
                alt={frame.room ?? frame.label ?? `Frame ${i + 1}`}
                className="w-full max-h-[520px] object-cover"
              />
            </div>
          ))}

          {/* Room label */}
          <div className="absolute bottom-4 left-4">
            <div className="bg-black/60 backdrop-blur-sm border border-white/10 rounded-md px-3 py-1.5">
              <p className="text-xs font-medium tracking-[0.15em] uppercase text-white">{frameLabel}</p>
            </div>
          </div>

          {/* Nav arrows */}
          {share.frames.length > 1 && (
            <>
              <button
                onClick={() => navigate(-1)}
                className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/50 backdrop-blur-sm border border-white/10 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/70"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={() => navigate(1)}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/50 backdrop-blur-sm border border-white/10 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/70"
              >
                <ChevronRight size={16} />
              </button>
            </>
          )}
        </div>

        {/* Dot/thumbnail strip */}
        {share.frames.length > 1 && (
          <div className="flex gap-2 mb-8 justify-center flex-wrap">
            {share.frames.map((frame, i) => (
              <button
                key={i}
                onClick={() => { setIsPlaying(false); setActiveIndex(i); }}
                className={`relative rounded-md overflow-hidden border-2 transition-all ${i === activeIndex ? "border-[#c8a96e] scale-105" : "border-[#2a2a2a] hover:border-[#c8a96e]/40"}`}
                style={{ width: 72, height: 48 }}
              >
                <img
                  src={`data:${frame.mimeType};base64,${frame.b64_json}`}
                  alt={frame.room ?? frame.label}
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-0 inset-x-0 bg-black/60 py-0.5">
                  <p className="text-[7px] text-white text-center truncate px-1 font-medium tracking-wide">
                    {frame.room ?? frame.label}
                  </p>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Design brief */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          <div className="bg-[#161616] border border-[#2a2a2a] rounded-xl p-5">
            <p className="text-[10px] tracking-[0.25em] uppercase text-[#8b7355] mb-3">Design Brief</p>
            <p className="text-sm text-[#c5bfb0] leading-relaxed">{share.prompt}</p>
          </div>
          <div className="bg-[#161616] border border-[#2a2a2a] rounded-xl p-5 flex flex-col justify-between">
            <div>
              <p className="text-[10px] tracking-[0.25em] uppercase text-[#8b7355] mb-3">About This Preview</p>
              <p className="text-sm text-[#c5bfb0] leading-relaxed mb-4">
                This is an AI-generated design concept created exclusively for you by Elite Design Studio. Our team can bring this vision to life with precision and craft.
              </p>
            </div>
            <Link href="/consultation">
              <Button className="w-full bg-[#c8a96e] hover:bg-[#b8995e] text-[#1a1a1a] text-xs tracking-[0.15em] uppercase font-semibold gap-2">
                Book a Free Consultation <ArrowRight size={13} />
              </Button>
            </Link>
          </div>
        </div>

        {/* Footer band */}
        <div className="border-t border-[#2a2a2a] pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-sm bg-[#c8a96e]/10 border border-[#c8a96e]/20 flex items-center justify-center">
              <span className="text-[10px] font-bold tracking-widest text-[#c8a96e]">EDS</span>
            </div>
            <div>
              <p className="text-xs font-semibold tracking-[0.15em] uppercase text-[#f5f0e8]">Elite Design Studio</p>
              <p className="text-[10px] text-[#8b7355]">Transforming spaces into experiences</p>
            </div>
          </div>
          <div className="flex gap-4 text-xs text-[#8b7355]">
            <Link href="/projects" className="hover:text-[#c8a96e] transition-colors">Our Work</Link>
            <Link href="/about" className="hover:text-[#c8a96e] transition-colors">About</Link>
            <Link href="/contact" className="hover:text-[#c8a96e] transition-colors">Contact</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
