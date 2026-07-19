import { useState } from "react";
import { ArrowRight, BrainCircuit, Sparkles, Target, TrendingUp } from "lucide-react";
import FounderProfile from "../components/business/FounderProfile";
import BusinessIdeaGenerator from "../components/business/BusinessIdeaGenerator";
import BusinessPlan from "../components/business/BusinessPlan";
import MonetizationPlanner from "../components/business/MonetizationPlanner";
import OfferBuilder from "../components/business/OfferBuilder";
import MarketingPlanner from "../components/business/MarketingPlanner";
import RevenueDashboard from "../components/business/RevenueDashboard";
import BusinessAIChat from "../components/business/BusinessAIChat";
import { askAI } from "../services/api";

const starterPlan = [
  { title: "Vision", content: "Define one sharp problem, one ideal customer, and one clear promise that makes your offer feel obvious." },
  { title: "Offer", content: "Package your service around a concrete outcome, a timeframe, and a transformation the customer can feel quickly." },
  { title: "Go-to-market", content: "Launch with one channel, one CTA, and one proof point so feedback loops are fast and useful." },
  { title: "Execution", content: "Track customer conversations, activation, and retention every week to accelerate the learning loop." },
];

const starterRevenueStreams = [
  { title: "Consulting", value: "$1.5k–$5k / project", description: "Sell strategy sprints, implementation help, and founder advisory sessions." },
  { title: "Subscription", value: "$29–$99 / month", description: "Package ongoing access, templates, and office hours for your audience." },
  { title: "Digital Product", value: "$19–$49 / sale", description: "Create an asset that scales without requiring live delivery every time." },
];

const starterOffers = [
  { title: "Founder Sprint", description: "A 90-minute session that clarifies positioning, offer design, and the first 30 days of execution." },
  { title: "Growth Playbook", description: "A practical operating system covering messaging, content, and promotion for early traction." },
  { title: "Done-With-You Support", description: "Ongoing weekly support for founders who need both strategy and accountability." },
];

const starterMarketing = [
  { title: "Messaging", description: "Write in plain language that explains the result, the audience, and the transformation." },
  { title: "Content", description: "Publish one insight-led piece of content each week to attract the right people into your orbit." },
  { title: "Conversion", description: "Offer a tiny lead magnet or low-friction workshop to capture attention and build trust." },
];

const starterMetrics = [
  { label: "Launch Readiness", value: "78%", },
  { label: "Projected MRR", value: "$3.2k", },
  { label: "Pipeline", value: "12 leads", },
];

function BusinessMentor() {
  const [profile, setProfile] = useState({
    businessName: "Northstar Studio",
    industry: "AI operations",
    experience: "7 years in product and growth",
    revenue: "$12k MRR",
    investment: "$5k",
    stage: "Pre-seed",
    audience: "Founders building AI products",
    goals: "Build an offer, validate demand, and create a sustainable growth engine.",
  });
  const [ideas, setIdeas] = useState([
    "A premium AI implementation studio for lean teams.",
    "A micro-consulting product for founders refining offers and positioning.",
    "A content engine that turns expertise into a paid newsletter and workshop funnel.",
  ]);
  const [plan, setPlan] = useState(starterPlan);
  const [revenueStreams, setRevenueStreams] = useState(starterRevenueStreams);
  const [offers, setOffers] = useState(starterOffers);
  const [marketing, setMarketing] = useState(starterMarketing);
  const [metrics] = useState(starterMetrics);
  const [loading, setLoading] = useState(false);

  const handleProfileChange = (field, value) => {
    setProfile((prev) => ({ ...prev, [field]: value }));
  };

  const handleGenerateIdeas = async () => {
    setLoading(true);
    try {
      const prompt = `You are an elite startup mentor. Create 4 crisp business ideas for a founder with this context: business=${profile.businessName}, industry=${profile.industry}, experience=${profile.experience}, target audience=${profile.audience}, goals=${profile.goals}. Return each idea on a new line with a short sentence.`;
      const response = await askAI(prompt);
      const formattedIdeas = response
        .split(/\n+/)
        .map((line) => line.replace(/^[-•*]\s*/, "").trim())
        .filter(Boolean)
        .slice(0, 4);

      setIdeas(formattedIdeas.length ? formattedIdeas : ["Focus on one painful niche and prove demand before expanding."]);
    } catch (error) {
      setIdeas(["Stay focused on a niche promise and let customer feedback refine the offer."]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <section className="rounded-[28px] bg-gradient-to-br from-indigo-600 via-violet-600 to-cyan-500 p-8 text-white shadow-xl">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/15 px-3 py-1 text-sm font-medium backdrop-blur">
              <Sparkles size={16} />
              Founder OS
            </div>
            <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">Turn your startup instincts into a repeatable growth engine.</h2>
            <p className="mt-3 text-sm leading-7 text-indigo-50 sm:text-base">
              Shape your offer, sharpen your positioning, and map a revenue strategy in one premium workspace.
            </p>
          </div>

          <div className="rounded-2xl border border-white/20 bg-white/10 p-4 backdrop-blur">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <Target size={16} />
              Smart momentum
            </div>
            <div className="mt-2 flex items-center gap-2 text-sm text-indigo-50">
              <TrendingUp size={16} />
              Build faster with AI guidance and clear next steps.
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <FounderProfile profile={profile} onChange={handleProfileChange} />
        <div className="space-y-6">
          <RevenueDashboard metrics={metrics} />
          <BusinessIdeaGenerator ideas={ideas} loading={loading} onGenerate={handleGenerateIdeas} />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <BusinessPlan plan={plan} />
        <MonetizationPlanner revenueStreams={revenueStreams} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <OfferBuilder offers={offers} />
        <MarketingPlanner marketing={marketing} />
      </div>

      <BusinessAIChat profile={profile} />
    </div>
  );
}

export default BusinessMentor;
