import { Award, Users, Globe, Heart } from "lucide-react";
import Navbar from "@/components/layout/navbar";
import { Badge } from "@/components/ui/badge";

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
      <div className="pt-28 pb-24">
        {/* Hero */}
        <div className="max-w-4xl mx-auto px-6 text-center mb-24">
          <p className="text-xs tracking-[0.3em] uppercase text-primary mb-3">Our Story</p>
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            Obsessed with<br />
            <span className="gold-text">Excellence</span>
          </h1>
          <p className="text-muted-foreground text-lg leading-relaxed max-w-2xl mx-auto">
            Elite Design Studio was founded on a single conviction: that thoughtful, beautiful spaces have the power to change how people feel, work, and live. Since 2009, we have pursued this belief without compromise.
          </p>
        </div>

        {/* Philosophy */}
        <div className="relative py-20 mb-24">
          <div
            className="absolute inset-0 bg-cover bg-center opacity-10"
            style={{ backgroundImage: "url('https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=1400&q=80')" }}
          />
          <div className="relative max-w-5xl mx-auto px-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
              <div>
                <p className="text-xs tracking-[0.3em] uppercase text-primary mb-4">Our Philosophy</p>
                <h2 className="text-3xl font-bold mb-6">Restraint as a Form of Luxury</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  We believe the most powerful interiors are the ones that look effortless. Not empty — considered. Not minimal — intentional. The most luxurious thing we can offer is clarity: a space where everything earns its place.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  Our process begins not with materials or moods, but with questions. How do you move through a room? Where does light fall in the morning? What do you want to feel when you come home? The answers shape everything.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { icon: Heart, label: "Client-First" },
                  { icon: Award, label: "Award-Winning" },
                  { icon: Globe, label: "Pan-India" },
                  { icon: Users, label: "Expert Team" },
                ].map(({ icon: Icon, label }) => (
                  <div key={label} className="glass-panel rounded-xl p-6 text-center">
                    <Icon size={24} className="text-primary mx-auto mb-3" />
                    <p className="text-xs tracking-[0.2em] uppercase font-medium">{label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Team */}
        <div className="max-w-7xl mx-auto px-6 mb-24">
          <div className="text-center mb-12">
            <p className="text-xs tracking-[0.3em] uppercase text-primary mb-2">The Team</p>
            <h2 className="text-3xl md:text-4xl font-bold">The Minds Behind the Work</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((member) => (
              <div key={member.name} className="group">
                <div className="aspect-[3/4] overflow-hidden rounded-xl mb-5 border border-border">
                  <img
                    src={member.img}
                    alt={member.name}
                    className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500 group-hover:scale-105"
                  />
                </div>
                <h3 className="font-semibold text-foreground tracking-wide">{member.name}</h3>
                <p className="text-xs text-primary tracking-wide mb-2">{member.role}</p>
                <p className="text-xs text-muted-foreground leading-relaxed">{member.bio}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Awards */}
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-12">
            <p className="text-xs tracking-[0.3em] uppercase text-primary mb-2">Recognition</p>
            <h2 className="text-3xl font-bold">Awards & Accolades</h2>
          </div>
          <div className="space-y-4">
            {awards.map((award) => (
              <div key={award.name} className="flex items-center justify-between p-6 rounded-xl border border-border bg-card hover:border-primary/30 transition-colors">
                <div className="flex items-center gap-6">
                  <span className="text-2xl font-bold text-primary/40 w-14 shrink-0">{award.year}</span>
                  <div>
                    <p className="font-semibold text-foreground tracking-wide">{award.name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{award.body}</p>
                  </div>
                </div>
                <Award size={20} className="text-primary/40 shrink-0" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
