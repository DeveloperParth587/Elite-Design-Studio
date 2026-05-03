import { Award, Users, Globe, Heart } from "lucide-react";
import Navbar from "@/components/layout/navbar";

const team = [
  {
    name: "Arjun Mehta",
    role: "Principal Designer & Founder",
    bio: "With 20 years crafting luxury interiors across India and Southeast Asia, Arjun brings an uncompromising eye for detail and a philosophy that great design is invisible.",
    img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80",
  },
  {
    name: "Priya Kapoor",
    role: "Head of Architecture",
    bio: "A graduate of the Architectural Association London, Priya leads our structural and spatial planning practice with precision and restraint.",
    img: "https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=400&q=80",
  },
  {
    name: "Siddharth Rao",
    role: "Director, Commercial Projects",
    bio: "Siddharth has delivered over 80 large-scale commercial interiors for India's most recognised brands, combining brand identity with spatial excellence.",
    img: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&q=80",
  },
  {
    name: "Kavya Nair",
    role: "Lighting Design Lead",
    bio: "Kavya specialises in the art of light — shaping atmosphere, guiding movement, and revealing materials in their most beautiful form.",
    img: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&q=80",
  },
];

const awards = [
  { year: "2024", name: "Interior Designer of the Year", body: "AD100 India" },
  { year: "2023", name: "Best Luxury Residential Project", body: "Architectural Digest Awards" },
  { year: "2022", name: "Commercial Excellence Award", body: "Design Business Council" },
  { year: "2021", name: "Rising Studio of the Year", body: "Asia Pacific Interior Design Awards" },
];

export default function About() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 sm:pt-28 pb-16 sm:pb-24">
        {/* Hero */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center mb-16 sm:mb-24">
          <p className="text-xs tracking-[0.3em] uppercase text-primary mb-3">Our Story</p>
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-5 sm:mb-6">
            Obsessed with<br />
            <span className="gold-text">Excellence</span>
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed text-sm sm:text-base md:text-lg">
            Founded in 2009 in Mumbai, Elite Design Studio has redefined what luxury interior design means for India's most discerning clients. We don't just design spaces — we engineer experiences.
          </p>
        </div>

        {/* Pillars */}
        <div className="border-y border-border py-14 sm:py-20 mb-16 sm:mb-24">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-10">
            {[
              { icon: Users, title: "Client-First", desc: "Every decision begins with understanding how you live, work, and feel in your space." },
              { icon: Award, title: "Award-Winning", desc: "Recognised by the Architectural Digest Awards, AD100 India, and the Design Business Council." },
              { icon: Globe, title: "Pan-India", desc: "Studios in Mumbai, Delhi, Bengaluru, and project delivery across 12 cities." },
              { icon: Heart, title: "Long-Term Relationships", desc: "68% of our clients return for subsequent projects. We build trust that lasts." },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex flex-col items-start sm:items-center sm:text-center">
                <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center mb-4">
                  <Icon size={18} className="text-primary" />
                </div>
                <h3 className="font-semibold text-sm sm:text-base tracking-wide mb-2">{title}</h3>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Team */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 mb-16 sm:mb-24">
          <div className="text-center mb-10 sm:mb-14">
            <p className="text-xs tracking-[0.3em] uppercase text-primary mb-2">The People</p>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold">Meet the Team</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
            {team.map((member) => (
              <div key={member.name} className="group text-center">
                <div className="w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 rounded-full overflow-hidden mx-auto mb-4 border-2 border-border group-hover:border-primary/40 transition-colors">
                  <img
                    src={member.img}
                    alt={member.name}
                    loading="lazy"
                    className="w-full h-full object-cover"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                  />
                </div>
                <h3 className="font-semibold text-sm tracking-wide">{member.name}</h3>
                <p className="text-[10px] text-primary tracking-[0.12em] uppercase mt-0.5 mb-2">{member.role}</p>
                <p className="text-xs text-muted-foreground leading-relaxed px-2">{member.bio}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Awards */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-8 sm:mb-10">
            <p className="text-xs tracking-[0.3em] uppercase text-primary mb-2">Recognition</p>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold">Awards & Honours</h2>
          </div>
          <div className="space-y-3 sm:space-y-4">
            {awards.map(({ year, name, body }) => (
              <div key={name} className="flex flex-col sm:flex-row sm:items-center justify-between p-5 sm:p-6 rounded-xl border border-border bg-card hover:border-primary/30 transition-colors gap-2 sm:gap-4">
                <div className="flex items-center gap-4 sm:gap-6">
                  <span className="text-primary font-bold text-base sm:text-lg shrink-0">{year}</span>
                  <div>
                    <h3 className="font-semibold tracking-wide text-sm sm:text-base">{name}</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">{body}</p>
                  </div>
                </div>
                <Award size={18} className="text-primary/40 hidden sm:block shrink-0" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
