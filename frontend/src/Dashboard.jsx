import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import generateExecutionFocusedContent from "./utils/aiContentGenerator.js";
import {
  TrendingUp,
  Target,
  Rocket,
  BarChart3,
  Users,
  Zap,
  Globe,
  Award,
  Calendar,
  DollarSign,
  Clock,
  Briefcase,
  Lightbulb,
  CheckCircle,
  ArrowRight,
  Star,
  Cpu,
  Brain,
  Shield,
  Settings,
  BookOpen,
  ChevronDown,
  ChevronUp,
  Play,
  AlertTriangle,
  Check,
  Eye,
  Download,
  Activity,
  Code,
  Smartphone,
  Bot,
  Compass,
  MapPin,
  Timer,
  Trophy,
  Flame,
  Sparkles,
  Gauge,
  Zap as ZapIcon,
  AlertCircle,
  TrendingUp as TrendingUpIcon,
  BarChart,
} from "lucide-react";

const fadeInUp = {
  initial: { opacity: 0, y: 60 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 },
};

const stagger = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const Dashboard = ({ data, onRestart }) => {
  const [activeSection, setActiveSection] = useState("execution-plan");
  const [aiContent, setAiContent] = useState(null);
  const [selectedOpportunity, setSelectedOpportunity] = useState(0);
  const [completedTasks, setCompletedTasks] = useState({});

  // Generate AI-powered execution content
  useEffect(() => {
    if (data?.answers) {
      const content = generateExecutionFocusedContent({
        experience: data.answers.experience,
        industry: data.answers.industry,
        goals: data.answers.goals,
        timeline: data.answers.timeline,
        budget: parseInt(data.answers.budget || 200000),
        skills: data.answers.skills,
        painPoints: data.answers.painPoints,
        workStyle: data.answers.workStyle,
      });
      setAiContent(content);
    }
  }, [data]);

  if (!aiContent) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-white text-xl">Generating your execution plan...</div>
      </div>
    );
  }

  const sections = [
    {
      id: "execution-plan",
      label: "Your Execution Plan",
      icon: Rocket,
      color: "cyan",
    },
    {
      id: "business-opportunities",
      label: "Business Opportunities",
      icon: Lightbulb,
      color: "purple",
    },
    {
      id: "monetization",
      label: "Monetization System",
      icon: DollarSign,
      color: "green",
    },
    {
      id: "tools-stack",
      label: "AI Tools Stack",
      icon: Cpu,
      color: "teal",
    },
    {
      id: "market-analysis",
      label: "Market Analysis",
      icon: BarChart3,
      color: "orange",
    },
    {
      id: "coaching",
      label: "Founder Coaching",
      icon: Brain,
      color: "pink",
    },
    {
      id: "launch-readiness",
      label: "Launch Readiness",
      icon: Trophy,
      color: "yellow",
    },
  ];

  const toggleTaskCompletion = (taskId) => {
    setCompletedTasks((prev) => ({
      ...prev,
      [taskId]: !prev[taskId],
    }));
  };

  // Execution Plan Section
  const renderExecutionPlan = () => {
    const roadmap =
      aiContent.executionRoadmaps[selectedOpportunity] ||
      aiContent.executionRoadmaps[0];

    return (
      <motion.div {...stagger} className="space-y-8">
        {/* Opportunity Selector */}
        <motion.div
          {...fadeInUp}
          className="bg-gradient-to-br from-slate-900/80 to-slate-800/80 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-8"
        >
          <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
            <Rocket className="w-6 h-6 text-cyan-400" />
            Select Your Focus Opportunity
          </h3>
          <div className="grid md:grid-cols-1 gap-4">
            {aiContent.businessOpportunities.map((opp, idx) => (
              <motion.button
                key={idx}
                onClick={() => setSelectedOpportunity(idx)}
                {...fadeInUp}
                className={`text-left p-6 rounded-2xl border transition-all duration-300 ${
                  selectedOpportunity === idx
                    ? "bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border-cyan-500/50"
                    : "bg-slate-800/50 border-slate-700/30 hover:border-cyan-500/30"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-lg font-bold mb-2">{opp.title}</h4>
                    <p className="text-slate-300 text-sm mb-3">
                      {opp.description}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <span className="px-2 py-1 bg-slate-700/50 rounded-full text-xs">
                        {opp.starterCost}
                      </span>
                      <span className="px-2 py-1 bg-slate-700/50 rounded-full text-xs">
                        {opp.timeline}
                      </span>
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          opp.viability >= 85
                            ? "bg-green-500/20 text-green-400"
                            : "bg-yellow-500/20 text-yellow-400"
                        }`}
                      >
                        {opp.viability}% Viability
                      </span>
                    </div>
                  </div>
                  {selectedOpportunity === idx && (
                    <CheckCircle className="w-6 h-6 text-cyan-400 flex-shrink-0 mt-1" />
                  )}
                </div>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Personalized Reasoning */}
        {aiContent.businessOpportunities[selectedOpportunity]
          ?.personalizedReasoning && (
          <motion.div
            {...fadeInUp}
            className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/20 rounded-3xl p-8"
          >
            <h3 className="text-xl font-bold mb-4 flex items-center gap-3">
              <Sparkles className="w-5 h-5 text-blue-400" />
              Why This Fits You
            </h3>
            <p className="text-slate-200 mb-4">
              {
                aiContent.businessOpportunities[selectedOpportunity]
                  ?.whyThisFits
              }
            </p>
            <div className="space-y-2">
              {aiContent.businessOpportunities[selectedOpportunity]?.personalizedReasoning.map(
                (reason, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                    <span className="text-slate-300">{reason}</span>
                  </div>
                )
              )}
            </div>
          </motion.div>
        )}

        {/* Execution Summary */}
        {roadmap?.summary && (
          <motion.div
            {...fadeInUp}
            className="bg-gradient-to-br from-slate-900/80 to-slate-800/80 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-8"
          >
            <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
              <MapPin className="w-6 h-6 text-cyan-400" />
              Day 1 / Week 1 / Month 1 Plan
            </h3>
            <div className="grid md:grid-cols-3 gap-4">
              {roadmap.summary.map((item, idx) => (
                <div key={idx} className="bg-slate-800/60 rounded-3xl p-5 border border-slate-700/30">
                  <div className="text-sm text-slate-400 mb-4 uppercase tracking-[0.2em]">
                    {item.horizon}
                  </div>
                  <ul className="space-y-2 text-slate-300">
                    {item.tasks.map((task, taskIdx) => (
                      <li key={taskIdx} className="flex items-start gap-2">
                        <span className="w-2 h-2 mt-1 rounded-full bg-cyan-400 flex-shrink-0" />
                        <span>{task}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Execution Phases */}
        {roadmap?.phases && (
          <motion.div
            {...fadeInUp}
            className="bg-gradient-to-br from-slate-900/80 to-slate-800/80 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-8"
          >
            <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
              <Calendar className="w-6 h-6 text-purple-400" />
              Your Roadmap to First Revenue
            </h3>

            <div className="space-y-8">
              {roadmap.phases.map((phase, phaseIdx) => (
                <div key={phaseIdx} className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center text-white font-bold">
                      {phaseIdx + 1}
                    </div>
                    <div>
                      <h4 className="text-lg font-bold">{phase.phase}</h4>
                      <p className="text-sm text-slate-400">{phase.duration}</p>
                    </div>
                  </div>

                  <div className="bg-slate-800/30 rounded-2xl p-6 ml-4 border border-slate-700/30">
                    <div className="mb-4">
                      <p className="text-slate-300">
                        <span className="font-semibold">Goal:</span>{" "}
                        {phase.goal}
                      </p>
                    </div>

                    <div className="space-y-4">
                      {phase.tasks.map((dayTasks, dayIdx) => {
                        const taskDate = dayTasks.day
                          ? `Day ${dayTasks.day}`
                          : dayTasks.week
                          ? `Week ${dayTasks.week}`
                          : `Month ${dayTasks.month}`;
                        const taskId = `${phaseIdx}-${dayIdx}`;

                        return (
                          <div
                            key={dayIdx}
                            className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/30"
                          >
                            <div className="flex items-center gap-3 mb-3">
                              <button
                                onClick={() => toggleTaskCompletion(taskId)}
                                className="flex-shrink-0"
                              >
                                <div
                                  className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${
                                    completedTasks[taskId]
                                      ? "bg-green-500 border-green-500"
                                      : "border-slate-600 hover:border-green-500"
                                  }`}
                                >
                                  {completedTasks[taskId] && (
                                    <Check className="w-4 h-4 text-white" />
                                  )}
                                </div>
                              </button>
                              <div>
                                <h5 className="font-semibold text-cyan-400">
                                  {taskDate}
                                </h5>
                                <p className="text-xs text-slate-400">
                                  {dayTasks.deadline}
                                </p>
                              </div>
                            </div>

                            <ul className="space-y-2 ml-9">
                              {dayTasks.tasks.map((task, taskIdx) => (
                                <li
                                  key={taskIdx}
                                  className="flex items-start gap-2 text-slate-300"
                                >
                                  <div className="w-1.5 h-1.5 bg-purple-400 rounded-full mt-1.5 flex-shrink-0"></div>
                                  <span>{task}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </motion.div>
    );
  };

  // Business Opportunities Section
  const renderBusinessOpportunities = () => (
    <motion.div {...stagger} className="space-y-8">
      {aiContent.businessOpportunities.map((opp, idx) => (
        <motion.div
          key={idx}
          {...fadeInUp}
          className="bg-gradient-to-br from-slate-900/80 to-slate-800/80 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-8"
        >
          <div className="mb-6">
            <h3 className="text-2xl font-bold mb-2 flex items-center gap-3">
              <Sparkles className="w-6 h-6 text-purple-400" />
              {opp.title}
            </h3>
            <p className="text-slate-300 mb-4">{opp.description}</p>
            <p className="text-sm text-slate-400 italic">
              Specificity: {opp.specificity}
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-4 mb-6">
            <div className="bg-slate-800/50 rounded-xl p-4">
              <div className="text-xs text-slate-400 mb-1">Starter Cost</div>
              <div className="text-lg font-bold text-green-400">
                {opp.starterCost}
              </div>
            </div>
            <div className="bg-slate-800/50 rounded-xl p-4">
              <div className="text-xs text-slate-400 mb-1">Timeline</div>
              <div className="text-lg font-bold text-cyan-400">{opp.timeline}</div>
            </div>
            <div className="bg-slate-800/50 rounded-xl p-4">
              <div className="text-xs text-slate-400 mb-1">Viability</div>
              <div className="text-lg font-bold text-yellow-400">
                {opp.viability}%
              </div>
            </div>
            <div className="bg-slate-800/50 rounded-xl p-4">
              <div className="text-xs text-slate-400 mb-1">Skill Fit</div>
              <div className="text-lg font-bold text-purple-400">
                {opp.skillAlignment}%
              </div>
            </div>
          </div>

          {opp.personalizedReasoning && (
            <div className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-2xl p-4 border border-blue-500/20">
              <div className="font-semibold mb-2 text-blue-300">
                Why this fits you:
              </div>
              <ul className="space-y-1">
                {opp.personalizedReasoning.map((reason, idx) => (
                  <li key={idx} className="text-sm text-slate-300 flex items-center gap-2">
                    <CheckCircle className="w-3 h-3 text-green-400" />
                    {reason}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </motion.div>
      ))}
    </motion.div>
  );

  // Monetization Section
  const renderMonetization = () => {
    const monetization = aiContent.monetizationSystems[selectedOpportunity];

    return (
      <motion.div {...stagger} className="space-y-8">
        {/* Pricing Models */}
        <motion.div
          {...fadeInUp}
          className="bg-gradient-to-br from-slate-900/80 to-slate-800/80 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-8"
        >
          <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
            <DollarSign className="w-6 h-6 text-green-400" />
            Pricing Models
          </h3>
          <div className="grid md:grid-cols-2 gap-6">
            {monetization?.pricingModels?.map((model, idx) => (
              <motion.div
                key={idx}
                {...fadeInUp}
                className="bg-gradient-to-br from-green-500/10 to-cyan-500/10 rounded-2xl p-6 border border-green-500/20"
              >
                <h4 className="text-lg font-bold mb-2">{model.model}</h4>
                <p className="text-sm text-slate-300 mb-4">
                  {model.description}
                </p>
                <div className="bg-slate-800/50 rounded-xl p-3 mb-4">
                  <div className="text-xs text-slate-400 mb-1">Pricing</div>
                  <div className="font-semibold text-green-400">{model.pricing}</div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-slate-400">Best for:</span>
                    <span className="text-sm">{model.bestFor}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-slate-400">Pros:</span>
                    <span className="text-sm text-green-400">{model.pros}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-slate-400">Cons:</span>
                    <span className="text-sm text-yellow-400">{model.cons}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Acquisition Channels */}
        <motion.div
          {...fadeInUp}
          className="bg-gradient-to-br from-slate-900/80 to-slate-800/80 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-8"
        >
          <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
            <Target className="w-6 h-6 text-blue-400" />
            Customer Acquisition Channels
          </h3>
          <div className="grid md:grid-cols-1 gap-6">
            {monetization?.acquisitionChannels?.map((channel, idx) => (
              <motion.div
                key={idx}
                {...fadeInUp}
                className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700/30"
              >
                <h4 className="text-lg font-bold mb-2">{channel.channel}</h4>
                <p className="text-slate-300 text-sm mb-4">
                  {channel.description}
                </p>
                <div className="grid md:grid-cols-4 gap-3">
                  <div>
                    <div className="text-xs text-slate-400 mb-1">Cost</div>
                    <div className="font-semibold">{channel.cost}</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-400 mb-1">CAC</div>
                    <div className="font-semibold text-green-400">
                      {channel.expectedCAC}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-400 mb-1">
                      Conversion
                    </div>
                    <div className="font-semibold text-cyan-400">
                      {channel.conversionRate}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-400 mb-1">Timeline</div>
                    <div className="font-semibold text-purple-400">
                      {channel.timeline}
                    </div>
                  </div>
                </div>
                <div className="mt-4">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      channel.priority === "Critical"
                        ? "bg-red-500/20 text-red-400"
                        : "bg-yellow-500/20 text-yellow-400"
                    }`}
                  >
                    {channel.priority}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Revenue Projections */}
        <motion.div
          {...fadeInUp}
          className="bg-gradient-to-br from-slate-900/80 to-slate-800/80 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-8"
        >
          <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
            <TrendingUp className="w-6 h-6 text-green-400" />
            Revenue Projections
          </h3>
          <div className="grid md:grid-cols-1 gap-4">
            {monetization?.revenueProjections?.map((projection, idx) => (
              <motion.div
                key={idx}
                {...fadeInUp}
                className="bg-gradient-to-r from-green-500/10 to-cyan-500/10 rounded-2xl p-6 border border-green-500/20"
              >
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h4 className="text-lg font-bold">{projection.month}</h4>
                    <p className="text-sm text-slate-400">{projection.goal}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-slate-400 mb-1">
                      Monthly Revenue
                    </div>
                    <div className="text-2xl font-bold text-green-400">
                      {projection.monthlyRevenue}
                    </div>
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-slate-800/50 rounded-lg p-3">
                    <div className="text-xs text-slate-400 mb-1">
                      Customers
                    </div>
                    <div className="font-semibold text-cyan-400">
                      {projection.customers}
                    </div>
                  </div>
                  <div className="bg-slate-800/50 rounded-lg p-3">
                    <div className="text-xs text-slate-400 mb-1">ARPU</div>
                    <div className="font-semibold text-cyan-400">
                      {projection.ARPU}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </motion.div>
    );
  };

  const renderToolsStack = () => {
    const tools = aiContent.aiToolsStack[selectedOpportunity] || [];

    return (
      <motion.div {...stagger} className="space-y-8">
        <motion.div
          {...fadeInUp}
          className="bg-gradient-to-br from-slate-900/80 to-slate-800/80 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-8"
        >
          <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
            <Cpu className="w-6 h-6 text-teal-400" />
            Recommended AI Tools & Workflows
          </h3>
          <div className="grid md:grid-cols-2 gap-6">
            {tools.map((tool, idx) => (
              <motion.div
                key={idx}
                {...fadeInUp}
                className="bg-slate-800/50 rounded-3xl p-6 border border-slate-700/30"
              >
                <div className="text-lg font-bold text-cyan-300 mb-2">{tool.tool}</div>
                <div className="text-sm text-slate-300 mb-4">{tool.use}</div>
                <div className="bg-slate-900/60 rounded-2xl p-4 text-slate-200 text-sm">
                  <div className="font-semibold text-slate-100 mb-2">Workflow</div>
                  <p>{tool.workflow}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </motion.div>
    );
  };

  // Market Analysis Section
  const renderMarketAnalysis = () => {
    const analysis = aiContent.marketAnalysis[selectedOpportunity];

    return (
      <motion.div {...stagger} className="space-y-8">
        {/* Market Scores */}
        <motion.div
          {...fadeInUp}
          className="bg-gradient-to-br from-slate-900/80 to-slate-800/80 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-8"
        >
          <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
            <BarChart3 className="w-6 h-6 text-orange-400" />
            Market Opportunity Analysis
          </h3>

          <div className="grid md:grid-cols-4 gap-6 mb-8">
            {[
              {
                label: "Demand Level",
                score: analysis?.demandLevel?.score,
                color: "green",
              },
              {
                label: "Competition",
                score: analysis?.competitionLevel?.score,
                color: "yellow",
              },
              {
                label: "Startup Difficulty",
                score: 10 - (analysis?.startupDifficulty?.score || 5),
                color: "blue",
              },
              {
                label: "Scalability",
                score: analysis?.scalabilityScore?.score,
                color: "purple",
              },
            ].map((metric, idx) => (
              <motion.div
                key={idx}
                {...fadeInUp}
                className={`bg-gradient-to-br from-${metric.color}-500/10 to-${metric.color}-500/5 rounded-2xl p-6 border border-${metric.color}-500/20`}
              >
                <div className="text-sm text-slate-400 mb-3">{metric.label}</div>
                <div className="flex items-center gap-4">
                  <div className="text-3xl font-bold text-white">
                    {metric.score}/10
                  </div>
                  <div className={`w-12 h-12 rounded-full bg-${metric.color}-500/20 flex items-center justify-center`}>
                    <div
                      className={`text-lg font-bold text-${metric.color}-400`}
                    >
                      {metric.score}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Detailed Insights */}
          <div className="grid md:grid-cols-2 gap-6">
            <motion.div
              {...fadeInUp}
              className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700/30"
            >
              <h4 className="text-lg font-bold mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-400" />
                Market Insights
              </h4>
              <ul className="space-y-2">
                {analysis?.marketInsights?.map((insight, idx) => (
                  <li key={idx} className="text-sm text-slate-300 flex gap-2">
                    <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                    {insight}
                  </li>
                ))}
              </ul>
            </motion.div>

            <motion.div
              {...fadeInUp}
              className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700/30"
            >
              <h4 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Shield className="w-5 h-5 text-blue-400" />
                Competitive Advantages
              </h4>
              <ul className="space-y-2">
                {analysis?.competitiveAdvantage?.map((advantage, idx) => (
                  <li key={idx} className="text-sm text-slate-300 flex gap-2">
                    <Sparkles className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
                    {advantage}
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>
        </motion.div>

        {/* Risks */}
        <motion.div
          {...fadeInUp}
          className="bg-gradient-to-br from-red-500/10 to-orange-500/10 backdrop-blur-xl border border-red-500/20 rounded-3xl p-8"
        >
          <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
            <AlertTriangle className="w-6 h-6 text-red-400" />
            Key Risks & Mitigations
          </h3>
          <div className="space-y-4">
            {analysis?.risks?.map((risk, idx) => (
              <motion.div
                key={idx}
                {...fadeInUp}
                className="bg-slate-800/50 rounded-2xl p-4 border border-slate-700/30"
              >
                <div className="flex items-start justify-between mb-2">
                  <h4 className="text-lg font-bold">{risk.risk}</h4>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      risk.probability === "Low"
                        ? "bg-green-500/20 text-green-400"
                        : risk.probability === "Medium"
                        ? "bg-yellow-500/20 text-yellow-400"
                        : "bg-red-500/20 text-red-400"
                    }`}
                  >
                    {risk.probability}
                  </span>
                </div>
                <p className="text-slate-300 text-sm">
                  <span className="font-semibold">Mitigation:</span>{" "}
                  {risk.mitigation}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </motion.div>
    );
  };

  // Founder Coaching Section
  const renderCoaching = () => (
    <motion.div {...stagger} className="space-y-8">
      {aiContent.coachingInsights?.map((insight, idx) => (
        <motion.div
          key={idx}
          {...fadeInUp}
          className="bg-gradient-to-br from-slate-900/80 to-slate-800/80 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-8"
        >
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-2xl font-bold">{insight.area}</h3>
            </div>
          </div>

          <div className="bg-slate-800/30 rounded-2xl p-6 mb-4 border border-slate-700/30">
            <p className="text-slate-200 mb-2 text-lg">{insight.insight}</p>
          </div>

          <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-2xl p-6 border border-purple-500/20">
            <div className="text-sm text-slate-400 mb-2">ACTION ITEM:</div>
            <p className="text-slate-200 font-semibold">{insight.actionable}</p>
          </div>
        </motion.div>
      ))}
    </motion.div>
  );

  // Launch Readiness Section
  const renderLaunchReadiness = () => {
    const readiness = aiContent.progressSystem;

    return (
      <motion.div {...stagger} className="space-y-8">
        {/* Overall Progress */}
        <motion.div
          {...fadeInUp}
          className="bg-gradient-to-br from-slate-900/80 to-slate-800/80 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-8"
        >
          <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
            <Trophy className="w-6 h-6 text-yellow-400" />
            Launch Readiness Score
          </h3>

          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="text-4xl font-bold text-yellow-400">
                  {readiness.launchReadiness.current}
                </div>
                <div className="text-sm text-slate-400">out of 100</div>
              </div>
              <div className="text-right">
                <div className="text-sm text-slate-400 mb-2">Your Progress</div>
                <div className="w-32 h-32 rounded-full bg-slate-800 flex items-center justify-center border-4 border-yellow-400">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-400">
                      {Math.round(
                        (readiness.launchReadiness.current /
                          readiness.launchReadiness.target) *
                          100
                      )}
                      %
                    </div>
                    <div className="text-xs text-slate-400">ready</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Stages */}
          <div className="space-y-4">
            {readiness.launchReadiness.stages?.map((stage, idx) => (
              <motion.div
                key={idx}
                {...fadeInUp}
                className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700/30"
              >
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-bold">{stage.name}</h4>
                  <div className="text-right">
                    <div className="text-sm text-slate-400 mb-1">Progress</div>
                    <div className="text-xl font-bold text-cyan-400">
                      {stage.current}%
                    </div>
                  </div>
                </div>

                <div className="bg-slate-700 rounded-full h-3 mb-4">
                  <motion.div
                    className="bg-gradient-to-r from-cyan-500 to-blue-500 h-3 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${stage.current}%` }}
                    transition={{ duration: 1, delay: idx * 0.1 }}
                  />
                </div>

                <ul className="space-y-2">
                  {stage.tasks?.map((task, taskIdx) => (
                    <li key={taskIdx} className="text-sm text-slate-300 flex items-center gap-2">
                      {stage.current === 100 ? (
                        <CheckCircle className="w-4 h-4 text-green-400" />
                      ) : (
                        <div className="w-4 h-4 rounded-full border border-slate-500"></div>
                      )}
                      {task}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Key Milestones */}
        <motion.div
          {...fadeInUp}
          className="bg-gradient-to-br from-slate-900/80 to-slate-800/80 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-8"
        >
          <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
            <Rocket className="w-6 h-6 text-cyan-400" />
            Key Milestones
          </h3>

          <div className="space-y-4">
            {readiness.keyMilestones?.map((milestone, idx) => (
              <motion.div
                key={idx}
                {...fadeInUp}
                className="flex items-center gap-4 bg-slate-800/50 rounded-2xl p-4 border border-slate-700/30"
              >
                <button
                  onClick={() => toggleTaskCompletion(`milestone-${idx}`)}
                  className="flex-shrink-0"
                >
                  <div
                    className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${
                      completedTasks[`milestone-${idx}`]
                        ? "bg-green-500 border-green-500"
                        : "border-slate-600 hover:border-green-500"
                    }`}
                  >
                    {completedTasks[`milestone-${idx}`] && (
                      <Check className="w-4 h-4 text-white" />
                    )}
                  </div>
                </button>
                <div className="flex-1">
                  <h4 className="font-semibold">{milestone.milestone}</h4>
                  <p className="text-sm text-slate-400">Target: {milestone.target}</p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-semibold ${
                    milestone.status === "completed"
                      ? "bg-green-500/20 text-green-400"
                      : "bg-slate-700/50 text-slate-400"
                  }`}
                >
                  {milestone.status}
                </span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </motion.div>
    );
  };

  // Render active section
  const renderSection = () => {
    switch (activeSection) {
      case "execution-plan":
        return renderExecutionPlan();
      case "business-opportunities":
        return renderBusinessOpportunities();
      case "monetization":
        return renderMonetization();
      case "tools-stack":
        return renderToolsStack();
      case "market-analysis":
        return renderMarketAnalysis();
      case "coaching":
        return renderCoaching();
      case "launch-readiness":
        return renderLaunchReadiness();
      default:
        return renderExecutionPlan();
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 overflow-x-hidden relative">
      {/* Background Glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-96 h-96 opacity-20 blur-3xl bg-cyan-500/20 rounded-full"></div>
        <div className="absolute top-1/4 right-0 w-80 h-80 opacity-15 blur-3xl bg-blue-500/20 rounded-full"></div>
        <div className="absolute bottom-0 left-1/4 w-72 h-72 opacity-18 blur-3xl bg-purple-500/20 rounded-full"></div>
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 opacity-12 blur-3xl bg-pink-500/20 rounded-full"></div>
      </div>

      {/* Header */}
      <div className="relative z-10 pt-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                Your AI Startup Strategist
              </h1>
              <p className="text-slate-400 text-lg">
                Execution-focused guidance for launching your next business
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-sm text-slate-400">Founder Score</div>
                <div className="text-2xl font-bold text-cyan-400">
                  {aiContent.founderScore}
                </div>
              </div>
              <button
                onClick={onRestart}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-full font-semibold transition-colors border border-slate-600"
              >
                Restart
              </button>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex flex-wrap gap-3 mb-8 overflow-x-auto pb-2">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`flex items-center gap-3 px-6 py-3 rounded-2xl font-semibold transition-all duration-300 whitespace-nowrap ${
                  activeSection === section.id
                    ? "bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg"
                    : "bg-slate-800/50 hover:bg-slate-700/50 text-slate-300 border border-slate-600/30"
                }`}
              >
                <section.icon className="w-5 h-5" />
                <span className="hidden sm:inline">{section.label}</span>
              </button>
            ))}
          </div>

          {/* Content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSection}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {renderSection()}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
