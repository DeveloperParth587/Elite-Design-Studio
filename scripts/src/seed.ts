import { db, projectsTable, leadsTable, testimonialsTable } from "@workspace/db";

async function seed() {
  console.log("Seeding Elite Design Studio data...");

  // Projects
  await db.insert(projectsTable).values([
    {
      title: "The Obsidian Penthouse",
      description: "A dramatic 5,000 sq ft penthouse in Mumbai's skyline. Dark marble, brushed gold accents, and curated art create an atmosphere of quiet power.",
      category: "Residential",
      imageUrl: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&q=80",
      featured: true,
      budget: "18500000",
      location: "Mumbai, Maharashtra",
      completedAt: "2024-11-15",
    },
    {
      title: "Serene Corporate Headquarters",
      description: "Reimagining the workplace for a fintech leader. Biophilic design meets corporate gravitas across 12,000 sq ft of collaborative and private spaces.",
      category: "Commercial",
      imageUrl: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80",
      featured: true,
      budget: "42000000",
      location: "Bengaluru, Karnataka",
      completedAt: "2024-09-30",
    },
    {
      title: "The Ivory Villa",
      description: "A complete transformation of a heritage bungalow. Ivory travertine, warm walnut joinery, and bespoke lighting across 8 immaculate rooms.",
      category: "Residential",
      imageUrl: "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=800&q=80",
      featured: true,
      budget: "9200000",
      location: "Hyderabad, Telangana",
      completedAt: "2025-01-20",
    },
    {
      title: "Azure Wellness Retreat",
      description: "A boutique spa and wellness centre designed to dissolve the boundary between interior and nature. Cool stone, warm timber, and meditative light.",
      category: "Commercial",
      imageUrl: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800&q=80",
      featured: true,
      budget: "28000000",
      location: "Udaipur, Rajasthan",
      completedAt: "2024-07-10",
    },
    {
      title: "The Copper Loft",
      description: "An industrial-luxe conversion in a heritage mill building. Exposed brick, copper fixtures, and deep emerald velvets tell a story of contrasts.",
      category: "Residential",
      imageUrl: "https://images.unsplash.com/photo-1598928506311-c55ded91a20c?w=800&q=80",
      featured: false,
      budget: "6800000",
      location: "Pune, Maharashtra",
      completedAt: "2025-02-28",
    },
    {
      title: "Prestige Dining Collective",
      description: "Three interconnected dining experiences under one roof. Each space distinct — raw concrete, lacquered ebony, and aged brass — yet united by refined luxury.",
      category: "Hospitality",
      imageUrl: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80",
      featured: false,
      budget: "35000000",
      location: "Delhi, NCR",
      completedAt: "2024-12-01",
    },
  ]).onConflictDoNothing();

  // Leads
  await db.insert(leadsTable).values([
    {
      name: "Aryan Mehta",
      email: "aryan.mehta@capitalventures.in",
      phone: "+91 98201 44321",
      budget: "7500000",
      timeline: 45,
      propertyType: "Full Home",
      message: "Looking to redesign our sea-facing apartment entirely. Need a complete transformation.",
      classification: "HOT",
      generatedEmail: "Subject: Your Bespoke Design Journey Begins\n\nDear Aryan,\n\nThank you for entrusting Elite Design Studio with your home. With a vision of this scale and a ₹75 lakh investment, we are ready to craft something truly extraordinary for you.\n\nOur Principal Designer would love to schedule a site visit at your earliest convenience.\n\nWarm regards,\nElite Design Studio",
    },
    {
      name: "Priya Sharma",
      email: "priya@sharmagroup.com",
      phone: "+91 90000 12345",
      budget: "950000",
      timeline: 90,
      propertyType: "Bedroom",
      message: "Want to redesign the master bedroom and attached bath.",
      classification: "COLD",
      generatedEmail: null,
    },
    {
      name: "Vikram Nair",
      email: "vnair@techlabs.io",
      phone: "+91 88001 99001",
      budget: "65000000",
      timeline: 20,
      propertyType: "Commercial",
      message: "Our new HQ needs a world-class design. Looking at around 15,000 sq ft.",
      classification: "HOT",
      generatedEmail: "Subject: Elite Design Studio — Ready for Your Vision\n\nDear Vikram,\n\nA project of this magnitude deserves an exceptional partner. We are prepared to dedicate our full creative and operational capacity to your headquarters project.\n\nLet us schedule an introductory call this week.\n\nWarm regards,\nElite Design Studio",
    },
    {
      name: "Sonal Agarwal",
      email: "sonal.agarwal@gmail.com",
      phone: null,
      budget: "250000",
      timeline: 120,
      propertyType: "Living Room",
      message: "Just looking for some inspiration for my living room.",
      classification: "COLD",
      generatedEmail: null,
    },
  ]).onConflictDoNothing();

  // Testimonials
  await db.insert(testimonialsTable).values([
    {
      clientName: "Rahul & Neha Kapoor",
      role: "Homeowners, Mumbai",
      content: "Elite Design Studio didn't just redesign our home — they reimagined how we live. Every corner feels intentional, every material speaks to us. The result is nothing short of transformative.",
      rating: 5,
      avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80",
    },
    {
      clientName: "Deepa Krishnamurti",
      role: "CEO, Artisan Collective",
      content: "Our retail space went from functional to phenomenal. The team's ability to balance brand identity with spatial beauty is extraordinary. Our footfall increased 40% after the redesign.",
      rating: 5,
      avatarUrl: "https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=100&q=80",
    },
    {
      clientName: "Sameer Joglekar",
      role: "Managing Director, Apex Realty",
      content: "We've worked with several top design firms, but Elite stands apart. The attention to detail, the quality of finishes they recommend, and the seamless project management made this the smoothest luxury renovation we've experienced.",
      rating: 5,
      avatarUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&q=80",
    },
    {
      clientName: "Tanvi Malhotra",
      role: "Founder, Marigold Hotels",
      content: "Elite Design Studio transformed our flagship property into a destination in itself. Guests consistently remark on the ambience. It's become central to our brand identity.",
      rating: 5,
      avatarUrl: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&q=80",
    },
  ]).onConflictDoNothing();

  console.log("Seeding complete.");
  process.exit(0);
}

seed().catch((e) => { console.error(e); process.exit(1); });
