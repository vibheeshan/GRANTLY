import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Bot,
  Send,
  Sparkles,
  HelpCircle,
  FileCheck2,
  Calendar,
  ExternalLink,
  ShieldCheck,
  RotateCcw,
  User,
  GraduationCap,
  Layers,
  Calculator,
  Compass
} from "lucide-react";
import { useScholarships } from "../context/ScholarshipContext.jsx";
import { Card, CardHeader, CardTitle, CardBody } from "../components/ui/Card.jsx";
import { Badge } from "../components/ui/Badge.jsx";
import { Button } from "../components/ui/Button.jsx";
import { formatCurrency, formatDate, getDaysRemaining } from "../utils/formatters.js";

const PRESET_QUESTIONS = [
  "Which scholarships am I 100% eligible for right now?",
  "Generate a tailored submission preparation checklist for Apex STEM Fellowship",
  "Can I combine or stack multiple scholarships without conflict?",
  "What is the highest award scholarship in the catalog?",
  "Which scholarships close within the next 30 days?",
  "What certificates am I still missing for 100% dossier readiness?"
];

export function AssistantPage() {
  const {
    studentProfile,
    allScholarships,
    documents,
    stats,
    applications,
    openMatchDna
  } = useScholarships();

  const [inputQuery, setInputQuery] = useState("");
  const [messages, setMessages] = useState(() => {
    try {
      const saved = localStorage.getItem("grantly_assistant_chat_history_v2");
      if (saved) return JSON.parse(saved);
    } catch (e) {
      // fallback
    }
    return [
      {
        id: "msg-welcome",
        sender: "bot",
        text: `Hello ${studentProfile.name.split(" ")[0]}! I am your GRANTLY Intelligence Assistant 2.0. I can explain your deterministic Match DNA, generate custom submission checklists, verify stackability rules, and index all 14 demonstration scholarships offline. What would you like to explore?`,
        scholarshipCards: []
      }
    ];
  });
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    try {
      localStorage.setItem("grantly_assistant_chat_history_v2", JSON.stringify(messages));
    } catch (e) {
      // ignore
    }
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  /**
   * Deterministic local query answering logic
   */
  const answerQueryLocally = (queryText) => {
    const q = queryText.toLowerCase();

    // 1. Generate preparation checklist
    if (q.includes("checklist") || q.includes("prepare") || q.includes("preparation")) {
      const target = allScholarships.find(s => q.includes(s.title.toLowerCase().slice(0, 10))) || allScholarships[0];
      const docList = target.requiredDocuments.map((doc, i) => {
        const isReady = documents.some(d => d.name.toLowerCase().includes(doc.toLowerCase()) && d.isReady);
        return `${i + 1}. [${isReady ? "READY ✓" : "ACTION NEEDED ⚠️"}] ${doc}`;
      }).join("\n");

      return {
        text: `Here is the tailored submission preparation checklist for "${target.title}":\n\n${docList}\n\nMilestones to complete:\n• Step A: Verify semester marksheet CGPA meets ${target.minimumPercentage}%\n• Step B: Obtain tahsildar/gazetted officer attestation on income slip\n• Step C: Dispatch online application before deadline (${formatDate(target.deadline)})`,
        scholarshipCards: [target]
      };
    }

    // 2. Stackability rules
    if (q.includes("stack") || q.includes("combine") || q.includes("conflict") || q.includes("double")) {
      return {
        text: `Stackability Policy Guide:\n• Corporate CSR & Philanthropy fellowships (like Apex NextGen & Pragati Tech) are generally STACKABLE with college tuition fee waivers.\n• State Government Quota grants (like Maharashtra Medha & Tamil Nadu Tech Inclusion) are NON-STACKABLE with other state welfare schemes—only one government fee concession may be claimed per academic year.\n\nUse our Funding Opportunity Calculator (/calculator) to model conflict-free scenarios automatically!`,
        scholarshipCards: allScholarships.filter(s => !s.stackable)
      };
    }

    // 3. 100% eligible
    if (q.includes("100%") || q.includes("eligible") || q.includes("match")) {
      const eligible = allScholarships.filter(s => s.isFullyEligible);
      if (eligible.length > 0) {
        return {
          text: `Based on your profile (${studentProfile.course}, ${studentProfile.educationLevel}, ${studentProfile.academicPercentage}% marks, and ₹${studentProfile.familyIncome.toLocaleString("en-IN")} income), you meet all 5 baseline criteria for ${eligible.length} demonstration scholarships:`,
          scholarshipCards: eligible
        };
      } else {
        return {
          text: `Currently, no scholarships meet 100% of all 5 mandatory criteria simultaneously. Check the Smart Eligibility Matcher to view partial matches or update your profile parameters.`,
          scholarshipCards: allScholarships.slice(0, 3)
        };
      }
    }

    // 4. Highest award
    if (q.includes("highest") || q.includes("maximum") || q.includes("most money") || q.includes("award")) {
      const sortedByAward = [...allScholarships].sort((a, b) => b.awardAmount - a.awardAmount);
      const top3 = sortedByAward.slice(0, 3);
      return {
        text: `The highest value award in the demonstration catalog is the "${top3[0].title}" providing ${formatCurrency(top3[0].awardAmount, top3[0].currency)} annually. Here are the top 3 awards:`,
        scholarshipCards: top3
      };
    }

    // 5. Deadlines / Close soon
    if (q.includes("deadline") || q.includes("closing") || q.includes("soon") || q.includes("month") || q.includes("upcoming")) {
      const soon = allScholarships.filter(s => {
        const days = getDaysRemaining(s.deadline);
        return days !== null && days >= 0 && days <= 35;
      });
      return {
        text: `Found ${soon.length} scholarships closing in the next 35 days. Be sure to submit before the dates listed:`,
        scholarshipCards: soon
      };
    }

    // 6. Missing documents
    if (q.includes("document") || q.includes("missing") || q.includes("dossier")) {
      const pendingDocs = documents.filter(d => !d.isReady);
      if (pendingDocs.length === 0) {
        return {
          text: `🎉 Great news! All ${documents.length} certificates in your Document Manager are marked as Ready!`,
          scholarshipCards: []
        };
      }
      const names = pendingDocs.map(d => `• ${d.name} (${d.category})`).join("\n");
      return {
        text: `You have ${pendingDocs.length} document(s) pending verification:\n\n${names}\n\nVisit the Document Readiness Center to mark them ready or simulate file upload.`,
        scholarshipCards: []
      };
    }

    // Fallback search
    const matched = allScholarships.filter(s => {
      const haystack = `${s.title} ${s.provider} ${s.description} ${s.eligibleCourses.join(" ")} ${s.categories.join(" ")}`.toLowerCase();
      return q.split(" ").some(word => word.length > 3 && haystack.includes(word));
    });

    if (matched.length > 0) {
      return {
        text: `Here are the demonstration scholarships matching your query:`,
        scholarshipCards: matched.slice(0, 3)
      };
    }

    return {
      text: `I couldn't find a direct match for that query in the demonstration database. You can ask about: eligibility, checklists, stackability rules, upcoming deadlines, highest awards, or discipline-specific grants!`,
      scholarshipCards: allScholarships.slice(0, 2)
    };
  };

  const handleSendQuery = (textToSend) => {
    const query = textToSend || inputQuery;
    if (!query.trim()) return;

    const userMessage = {
      id: `usr-${Date.now()}`,
      sender: "user",
      text: query.trim()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputQuery("");
    setIsTyping(true);

    setTimeout(() => {
      const response = answerQueryLocally(query);
      const botMessage = {
        id: `bot-${Date.now()}`,
        sender: "bot",
        text: response.text,
        scholarshipCards: response.scholarshipCards || []
      };
      setMessages(prev => [...prev, botMessage]);
      setIsTyping(false);
    }, 400);
  };

  const handleResetChat = () => {
    const welcome = [
      {
        id: "msg-welcome-new",
        sender: "bot",
        text: `Chat reset. What would you like to explore across the demonstration records?`,
        scholarshipCards: []
      }
    ];
    setMessages(welcome);
    try {
      localStorage.setItem("grantly_assistant_chat_history_v2", JSON.stringify(welcome));
    } catch (e) {
      // ignore
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300 text-xs font-semibold mb-2">
            <Bot className="w-3.5 h-3.5" />
            <span>Local Knowledge Query Assistant</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-heading tracking-tight">
            GRANTLY Assistant 2.0
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Fast, deterministic natural language querying over local demonstration records, Match DNA, and your application profile.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={handleResetChat}
          icon={RotateCcw}
        >
          Reset Chat
        </Button>
      </div>

      {/* Main Chat Interface Box */}
      <Card className="flex flex-col h-[650px] shadow-sm overflow-hidden">
        {/* Assistant Header Info Bar */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-violet-600 text-white flex items-center justify-center font-bold">
              <Bot className="w-4 h-4" />
            </div>
            <div>
              <p className="font-bold text-slate-900 dark:text-white leading-tight">
                GRANTLY Intelligence Bot
              </p>
              <p className="text-[11px] text-slate-400">
                14 Demonstration Grants • Local Deterministic Engine • Offline
              </p>
            </div>
          </div>

          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-300">
            Offline Mode
          </span>
        </div>

        {/* Messages Scroll Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${
                msg.sender === "user" ? "flex-row-reverse" : "flex-row"
              }`}
            >
              {msg.sender === "bot" ? (
                <div className="w-8 h-8 rounded-xl bg-violet-100 dark:bg-violet-950 text-violet-700 dark:text-violet-300 flex items-center justify-center shrink-0 mt-0.5">
                  <Bot className="w-4 h-4" />
                </div>
              ) : (
                <img
                  src={studentProfile.avatar}
                  alt="Student"
                  className="w-8 h-8 rounded-full object-cover ring-1 ring-violet-500 shrink-0 mt-0.5"
                />
              )}

              <div
                className={`max-w-2xl rounded-2xl p-4 text-xs sm:text-sm leading-relaxed ${
                  msg.sender === "user"
                    ? "bg-violet-600 text-white shadow-sm"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-200/80 dark:border-slate-700/60"
                }`}
              >
                <div className="whitespace-pre-line">{msg.text}</div>

                {/* If scholarship recommendations attached */}
                {msg.scholarshipCards && msg.scholarshipCards.length > 0 && (
                  <div className="mt-3 space-y-2 pt-3 border-t border-slate-200 dark:border-slate-700">
                    {msg.scholarshipCards.map((sch) => (
                      <div
                        key={sch.id}
                        className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs flex items-center justify-between gap-3 text-slate-800 dark:text-slate-200 shadow-xs"
                      >
                        <div className="min-w-0">
                          <span className="font-bold block truncate hover:text-violet-600">
                            {sch.title}
                          </span>
                          <span className="text-violet-600 dark:text-violet-400 font-semibold text-[11px]">
                            {formatCurrency(sch.awardAmount, sch.currency)}
                          </span>
                          <span className="text-slate-400 text-[11px] ml-2">
                            • Deadline: {formatDate(sch.deadline)}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <Button
                            size="xs"
                            variant="outline"
                            onClick={() => openMatchDna(sch)}
                          >
                            DNA
                          </Button>
                          <Link to={`/scholarship/${sch.id}`}>
                            <Button size="xs" variant="primary">
                              Details
                            </Button>
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-violet-100 dark:bg-violet-950 text-violet-700 dark:text-violet-300 flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4 animate-pulse" />
              </div>
              <div className="bg-slate-100 dark:bg-slate-800 p-3.5 rounded-2xl flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" />
                <span className="w-2 h-2 rounded-full bg-slate-400 animate-bounce [animation-delay:0.2s]" />
                <span className="w-2 h-2 rounded-full bg-slate-400 animate-bounce [animation-delay:0.4s]" />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Preset Suggestions Row */}
        <div className="px-4 py-2.5 bg-slate-50/80 dark:bg-slate-800/40 border-t border-slate-200/80 dark:border-slate-800 flex items-center gap-2 overflow-x-auto scrollbar-none">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider shrink-0 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-violet-500" />
            Suggestions:
          </span>
          {PRESET_QUESTIONS.map((pq, idx) => (
            <button
              key={idx}
              onClick={() => handleSendQuery(pq)}
              className="text-xs px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-violet-400 hover:text-violet-600 dark:hover:text-violet-400 shrink-0 transition-colors cursor-pointer whitespace-nowrap shadow-xs"
            >
              {pq}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-3 sm:p-4 bg-white dark:bg-slate-900 border-t border-slate-200/80 dark:border-slate-800">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendQuery();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              placeholder="Ask about checklists, stackability rules, Match DNA, deadlines..."
              className="flex-1 py-2.5 px-4 text-xs sm:text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-800/60 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500"
            />
            <Button
              type="submit"
              variant="primary"
              size="md"
              icon={Send}
              disabled={!inputQuery.trim()}
            >
              Ask
            </Button>
          </form>
          <p className="text-[10px] text-slate-400 text-center mt-2">
            Local simulated query assistant. Does not use external APIs or live LLMs.
          </p>
        </div>
      </Card>
    </div>
  );
}
