import { GoogleGenAI, Type, Modality, ThinkingLevel, VideoGenerationReferenceType } from "@google/genai";
import { MonetizationPath, BusinessOffer, WeeklyReview, LandingPage } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

export async function researchLead(leadName: string, offer: BusinessOffer): Promise<string> {
  const model = "gemini-3-flash-preview";
  
  const response = await ai.models.generateContent({
    model,
    contents: `Research this potential lead for a ${offer.niche} service: ${leadName}.
    Find their recent activities, business focus, and any pain points that ${offer.title} could solve.
    Offer Description: ${offer.description}`,
    config: {
      tools: [{ googleSearch: {} }],
      systemInstruction: "You are a sales researcher. Find specific, actionable details about a lead that can be used for personalization. Focus on their business needs and recent public updates."
    }
  });

  return response.text;
}

export async function generatePersonalizedScripts(leadInfo: string, offer: BusinessOffer): Promise<{ dm: string, email: string, followUp: string }> {
  const model = "gemini-3.1-pro-preview";
  
  const response = await ai.models.generateContent({
    model,
    contents: `Generate highly personalized outreach scripts using this lead research:
    Lead Research: ${leadInfo}
    
    Offer: ${offer.title}
    Description: ${offer.description}
    
    Provide:
    1. A short, personalized DM script (Instagram/LinkedIn)
    2. A professional cold email script
    3. A gentle follow-up script`,
    config: {
      thinkingConfig: { thinkingLevel: ThinkingLevel.HIGH },
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          dm: { type: Type.STRING },
          email: { type: Type.STRING },
          followUp: { type: Type.STRING }
        },
        required: ["dm", "email", "followUp"]
      }
    }
  });

  return JSON.parse(response.text);
}

export async function generateOutreachImage(prompt: string, aspectRatio: string = "1:1"): Promise<string> {
  const model = "gemini-3.1-flash-image-preview";
  // Create a fresh instance to use the selected API key from the dialog
  const visualAi = new GoogleGenAI({ apiKey: process.env.API_KEY || process.env.GEMINI_API_KEY! });
  
  const response = await visualAi.models.generateContent({
    model,
    contents: {
      parts: [{ text: prompt }]
    },
    config: {
      imageConfig: {
        aspectRatio: aspectRatio as any,
        imageSize: "1K"
      }
    }
  });

  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }
  return "";
}

export async function generateOutreachVideo(prompt: string, imageBase64?: string): Promise<string> {
  const model = "veo-3.1-fast-generate-preview";
  // Create a fresh instance to use the selected API key from the dialog
  const visualAi = new GoogleGenAI({ apiKey: process.env.API_KEY || process.env.GEMINI_API_KEY! });
  
  const config: any = {
    numberOfVideos: 1,
    resolution: '720p',
    aspectRatio: '16:9'
  };

  let operation;
  if (imageBase64) {
    operation = await visualAi.models.generateVideos({
      model,
      prompt,
      image: {
        imageBytes: imageBase64.split(',')[1],
        mimeType: 'image/png'
      },
      config
    });
  } else {
    operation = await visualAi.models.generateVideos({
      model,
      prompt,
      config
    });
  }

  while (!operation.done) {
    await new Promise(resolve => setTimeout(resolve, 5000));
    operation = await visualAi.operations.getVideosOperation({ operation });
  }

  const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
  if (!downloadLink) return "";

  const response = await fetch(downloadLink, {
    method: 'GET',
    headers: {
      'x-goog-api-key': process.env.API_KEY || process.env.GEMINI_API_KEY!,
    },
  });

  const blob = await response.blob();
  return URL.createObjectURL(blob);
}

export async function scoreLead(leadName: string, offer: BusinessOffer): Promise<{ score: number, reasoning: string }> {
  const model = "gemini-3-flash-preview";
  
  const response = await ai.models.generateContent({
    model,
    contents: `Score this potential lead for a ${offer.niche} service: ${leadName}.
    Offer: ${offer.title}
    Description: ${offer.description}
    
    Provide a score from 1-100 based on:
    1. Fit: How likely is this lead to need ${offer.title}?
    2. Value: What is the potential revenue or impact of this lead?
    3. Intent: Based on the lead name/type, do they seem like a decision-maker or a high-growth business?
    
    If the offer is about 'AI-powered CRM setup' or CRM automation, look for signs that the lead would benefit from streamlined sales processes and data-driven insights.
    
    Return a JSON object with 'score' (number) and 'reasoning' (string, max 30 words).`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          score: { type: Type.NUMBER },
          reasoning: { type: Type.STRING }
        },
        required: ["score", "reasoning"]
      }
    }
  });

  return JSON.parse(response.text);
}

export async function suggestNextStep(lead: any, offer: BusinessOffer): Promise<string> {
  const model = "gemini-3.1-flash-lite-preview";
  
  const response = await ai.models.generateContent({
    model,
    contents: `Suggest the next best action for this lead in the sales pipeline.
    Lead Name: ${lead.name}
    Current Status: ${lead.status}
    Offer: ${offer.title}
    
    Keep it short and actionable (max 15 words).`,
    config: {
      systemInstruction: "You are a sales assistant. Provide quick, low-latency suggestions for the next step in a sales process."
    }
  });

  return response.text;
}

export async function analyzeLandingPage(landingPage: Partial<LandingPage>): Promise<string> {
  const model = "gemini-3.1-pro-preview";
  
  const response = await ai.models.generateContent({
    model,
    contents: `Analyze this landing page for conversion optimization:
    Headline: ${landingPage.headline}
    Subheadline: ${landingPage.subheadline}
    Benefits: ${JSON.stringify(landingPage.benefits)}
    CTAs: ${JSON.stringify(landingPage.ctas)}
    
    Provide 3 specific, actionable suggestions to improve the conversion rate. Focus on psychological triggers and clarity.`,
    config: {
      thinkingConfig: { thinkingLevel: ThinkingLevel.HIGH },
      systemInstruction: "You are a conversion rate optimization (CRO) expert. Provide high-impact suggestions to improve landing page performance."
    }
  });

  return response.text;
}

export async function generateHeroImagePrompt(offer: BusinessOffer): Promise<string> {
  const model = "gemini-3-flash-preview";
  
  const response = await ai.models.generateContent({
    model,
    contents: `Generate a detailed, high-quality AI image generation prompt (for Midjourney or DALL-E) for a landing page hero section.
    Business Offer: ${offer.title}
    Niche: ${offer.niche}
    Description: ${offer.description}
    
    The prompt should describe a professional, high-converting scene that resonates with the target audience. 
    Refine the prompt to include:
    1. Specific details about the target audience's aspirations (what they want to achieve).
    2. The desired emotional response (how they should feel when they see the image, e.g., inspired, relieved, empowered).
    3. Focus on lighting, composition, and mood.`,
    config: {
      systemInstruction: "You are an expert at crafting prompts for AI image generators. Create visually stunning, professional prompts that align with business branding."
    }
  });

  return response.text;
}

export async function generateLandingPage(offer: BusinessOffer): Promise<Partial<LandingPage>> {
  const model = "gemini-3.1-pro-preview";
  
  const response = await ai.models.generateContent({
    model,
    contents: `Generate high-converting landing page copy for this business offer:
    Offer Title: ${offer.title}
    Niche: ${offer.niche}
    Description: ${offer.description}
    Tiers: ${JSON.stringify(offer.tiers)}
    
    Provide:
    1. A magnetic headline
    2. A persuasive sub-headline
    3. A detailed prompt for a hero image (AI image generation style) that includes specific details about the target audience's aspirations and the desired emotional response.
    4. 3 key benefits with titles and descriptions
    5. 3 social proof placeholders (what kind of testimonials would work best)
    6. 3 Call to Action (CTA) variations for different goals: 'Book a Call', 'Download Guide', 'Sign Up'
    7. 3 frequently asked questions (FAQ) with answers
    8. SEO Meta Tags: A title (max 60 chars), a description (max 160 chars), and 5-10 relevant keywords.`,
    config: {
      thinkingConfig: { thinkingLevel: ThinkingLevel.HIGH },
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          headline: { type: Type.STRING },
          subheadline: { type: Type.STRING },
          heroImagePrompt: { type: Type.STRING },
          benefits: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                description: { type: Type.STRING }
              },
              required: ["title", "description"]
            }
          },
          socialProofPlaceholders: { type: Type.ARRAY, items: { type: Type.STRING } },
          ctas: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                text: { type: Type.STRING },
                goal: { type: Type.STRING }
              },
              required: ["text", "goal"]
            }
          },
          faq: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                question: { type: Type.STRING },
                answer: { type: Type.STRING }
              },
              required: ["question", "answer"]
            }
          },
          seoTitle: { type: Type.STRING },
          seoDescription: { type: Type.STRING },
          seoKeywords: { type: Type.STRING }
        },
        required: ["headline", "subheadline", "heroImagePrompt", "benefits", "socialProofPlaceholders", "ctas", "faq", "seoTitle", "seoDescription", "seoKeywords"]
      }
    }
  });

  const result = JSON.parse(response.text);
  return {
    ...result,
    offerId: offer.id,
    selectedCtaIndex: 0,
    createdAt: Date.now()
  };
}

export async function generateCtaVariations(offer: BusinessOffer, goal: string): Promise<{ text: string; goal: string }[]> {
  const model = "gemini-3-flash-preview";
  
  const response = await ai.models.generateContent({
    model,
    contents: `Generate 3 high-converting Call to Action (CTA) variations for this goal: '${goal}'.
    Offer Title: ${offer.title}
    Niche: ${offer.niche}
    Description: ${offer.description}
    
    The CTAs should be short, punchy, and action-oriented.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            text: { type: Type.STRING },
            goal: { type: Type.STRING }
          },
          required: ["text", "goal"]
        }
      }
    }
  });

  return JSON.parse(response.text);
}

export async function generateMonetizationPath(input: { skills: string[], tools: string[], timeAvailable: string }): Promise<Partial<MonetizationPath>> {
  const model = "gemini-3.1-pro-preview";
  
  const response = await ai.models.generateContent({
    model,
    contents: `Analyze these inputs and recommend the best monetization path for a service-based business in the Indian market.
    Skills: ${input.skills.join(", ")}
    Tools: ${input.tools.join(", ")}
    Time Available: ${input.timeAvailable}
    
    Provide:
    1. Recommended Service
    2. Income Timeline (how long to reach ₹25k/month)
    3. Suggested Pricing (per client or per project in INR)
    4. A detailed Launch Plan with specific, actionable milestones. 
       For each major step, you MUST define:
       - 'phase': A clear name for the milestone (e.g., 'Foundation', 'Outreach', 'Scaling').
       - 'timeline': A realistic timeframe (e.g., 'Week 1', 'Week 2-3', 'Month 1').
       - 'deliverables': A list of concrete, actionable items to complete (e.g., 'Create a portfolio of 3 samples', 'Send 50 cold DMs', 'Set up a basic landing page').
       The plan should be easy to follow and highly practical.`,
    config: {
      thinkingConfig: { thinkingLevel: ThinkingLevel.HIGH },
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          recommendedService: { type: Type.STRING },
          timeline: { type: Type.STRING },
          suggestedPricing: { type: Type.STRING },
          launchPlan: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                phase: { type: Type.STRING },
                timeline: { type: Type.STRING },
                deliverables: { type: Type.ARRAY, items: { type: Type.STRING } }
              },
              required: ["phase", "timeline", "deliverables"]
            }
          }
        },
        required: ["recommendedService", "timeline", "suggestedPricing", "launchPlan"]
      }
    }
  });

  const result = JSON.parse(response.text);
  return {
    ...result,
    skills: input.skills,
    tools: input.tools,
    timeAvailable: input.timeAvailable,
    status: 'draft',
    createdAt: Date.now()
  };
}

export async function generateOffer(niche: string, service: string): Promise<Partial<BusinessOffer>> {
  const model = "gemini-3.1-pro-preview";
  
  const response = await ai.models.generateContent({
    model,
    contents: `Build a high-ticket service offer for the following:
    Niche: ${niche}
    Service: ${service}
    
    Create 3 pricing tiers (Basic, Standard, Premium) with specific deliverables for each.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          description: { type: Type.STRING },
          tiers: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                price: { type: Type.STRING },
                deliverables: { type: Type.ARRAY, items: { type: Type.STRING } }
              },
              required: ["name", "price", "deliverables"]
            }
          }
        },
        required: ["title", "description", "tiers"]
      }
    }
  });

  const result = JSON.parse(response.text);
  return {
    ...result,
    niche,
    locked: false,
    createdAt: Date.now()
  };
}

export async function generateOutreachScripts(offer: BusinessOffer): Promise<{ dm: string, email: string, followUp: string }> {
  const model = "gemini-3.1-pro-preview";
  
  const response = await ai.models.generateContent({
    model,
    contents: `Generate high-conversion outreach scripts for this offer:
    Offer: ${offer.title}
    Description: ${offer.description}
    
    Provide:
    1. A short, personalized DM script (Instagram/LinkedIn)
    2. A professional cold email script
    3. A gentle follow-up script`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          dm: { type: Type.STRING },
          email: { type: Type.STRING },
          followUp: { type: Type.STRING }
        },
        required: ["dm", "email", "followUp"]
      }
    }
  });

  return JSON.parse(response.text);
}

export async function generateWeeklyReview(metrics: WeeklyReview['metrics'], currentPlan: string): Promise<Partial<WeeklyReview>> {
  const model = "gemini-3.1-pro-preview";
  
  const response = await ai.models.generateContent({
    model,
    contents: `Analyze these weekly performance metrics and provide strategic feedback.
    Metrics: ${JSON.stringify(metrics)}
    Current Plan: ${currentPlan}
    
    Identify bottlenecks and suggest a plan for next week.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          aiFeedback: { type: Type.STRING },
          nextWeekPlan: { type: Type.STRING }
        },
        required: ["aiFeedback", "nextWeekPlan"]
      }
    }
  });

  const result = JSON.parse(response.text);
  return {
    ...result,
    metrics,
    createdAt: Date.now()
  };
}

export async function getMentorResponse(history: { role: 'user' | 'model', text: string }[], message: string) {
  const model = "gemini-3.1-pro-preview";
  
  const contents = [
    ...history.map(h => ({ role: h.role === 'user' ? 'user' : 'model', parts: [{ text: h.text }] })),
    { role: 'user', parts: [{ text: message }] }
  ];

  const response = await ai.models.generateContent({
    model,
    contents,
    config: {
      tools: [{ googleSearch: {} }],
      systemInstruction: "You are the AI Mentor for Paisapreneur AI. You act like a startup coach. Answer user questions conversationally. Give actionable advice only (no theory). Focus on making money quickly in the Indian market. Be practical and execution-focused. Use Google Search to provide up-to-date market data."
    }
  });

  return response.text;
}

export function connectMentorLive(callbacks: any) {
  return ai.live.connect({
    model: "gemini-3.1-flash-live-preview",
    callbacks,
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        voiceConfig: { prebuiltVoiceConfig: { voiceName: "Zephyr" } },
      },
      systemInstruction: "You are the AI Mentor for Paisapreneur AI. You act like a startup coach. Answer user questions conversationally via voice. Give actionable advice only (no theory). Focus on making money quickly in the Indian market. Be practical and execution-focused.",
    },
  });
}

export async function textToSpeech(text: string): Promise<string> {
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-preview-tts",
    contents: [{ parts: [{ text }] }],
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } },
      },
    },
  });

  return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data || "";
}
