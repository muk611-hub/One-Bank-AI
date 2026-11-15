import React, { useState, useEffect, useCallback } from 'react';
import { 
  CustomerProfile, 
  ChatMessage, 
  ActivityItem 
} from './types';
import { 
  INITIAL_CUSTOMER_PROFILE, 
  INITIAL_ACTIVITIES 
} from './data/mockData';
import { processUserMessage } from './services/intentEngine';
import { speechService, VoiceLanguage } from './services/speechService';
import { LoginScreen } from './components/LoginScreen';
import { Header } from './components/Header';
import { AIChatInterface } from './components/AIChatInterface';
import { ActivityTimeline } from './components/ActivityTimeline';
import { PersonalizedOffers } from './components/PersonalizedOffers';
import { CustomerProfileMemory } from './components/CustomerProfileMemory';
import { SecurityCenter } from './components/SecurityCenter';
import { GuidedTourModal } from './components/GuidedTourModal';
import { ArchitectureModal } from './components/ArchitectureModal';
import { ExplainabilityModal } from './components/ExplainabilityModal';
import { Volume2, VolumeX, Square, Play, Sparkles } from 'lucide-react';

export default function App() {
  // State: Authentication
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  // State: Customer Data with local state persistence
  const [customer, setCustomer] = useState<CustomerProfile>(() => {
    const saved = localStorage.getItem('one_ai_customer_profile');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return INITIAL_CUSTOMER_PROFILE;
      }
    }
    return INITIAL_CUSTOMER_PROFILE;
  });

  // State: Activities
  const [activities, setActivities] = useState<ActivityItem[]>(() => {
    const saved = localStorage.getItem('one_ai_activities');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return INITIAL_ACTIVITIES;
      }
    }
    return INITIAL_ACTIVITIES;
  });

  // State: Active Navigation Tab
  const [activeTab, setActiveTab] = useState<'chat' | 'activity' | 'offers' | 'memory' | 'security'>('chat');

  // State: Chat Messages
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'init_welcome_msg',
      sender: 'ai',
      text: 'Hi Mukesh 👋 How can I assist you today?',
      timestamp: 'Just now',
    }
  ]);

  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  // Default speech synthesis to enabled so AI always speaks
  const [speechEnabled, setSpeechEnabled] = useState<boolean>(true);
  const [voiceLanguage, setVoiceLanguage] = useState<VoiceLanguage>(() => {
    const saved = localStorage.getItem('one_ai_voice_language');
    return saved === 'hi' ? 'hi' : 'en';
  });
  const [isAiSpeaking, setIsAiSpeaking] = useState<boolean>(false);
  const [speakingMsgId, setSpeakingMsgId] = useState<string | null>(null);
  const [speakingSnippet, setSpeakingSnippet] = useState<string>('');

  // State: Modals
  const [isGuidedTourOpen, setIsGuidedTourOpen] = useState<boolean>(false);
  const [isArchitectureOpen, setIsArchitectureOpen] = useState<boolean>(false);
  const [isExplainabilityOpen, setIsExplainabilityOpen] = useState<boolean>(false);
  const [explainabilityContext, setExplainabilityContext] = useState<string>('General Eligibility');

  // Persist customer & activity changes
  useEffect(() => {
    localStorage.setItem('one_ai_customer_profile', JSON.stringify(customer));
  }, [customer]);

  useEffect(() => {
    localStorage.setItem('one_ai_activities', JSON.stringify(activities));
  }, [activities]);

  // Sync muted state & voice language to speech service
  useEffect(() => {
    speechService.setMuted(!speechEnabled);
  }, [speechEnabled]);

  useEffect(() => {
    speechService.setLanguage(voiceLanguage);
    localStorage.setItem('one_ai_voice_language', voiceLanguage);
  }, [voiceLanguage]);

  // Speech synthesis for AI replies
  const speakText = useCallback((text: string, msgId?: string, overrideLanguage?: VoiceLanguage) => {
    if (!speechEnabled) return;
    try {
      speechService.unlockAudio();
      const targetLang = overrideLanguage || voiceLanguage;
      setIsAiSpeaking(false);
      setSpeakingMsgId(msgId || null);
      setSpeakingSnippet(text.slice(0, 75) + (text.length > 75 ? '...' : ''));

      speechService.speak(text, {
        rate: 1.0,
        pitch: 1.05,
        language: targetLang,
        onStart: () => {
          setIsAiSpeaking(true);
        },
        onEnd: () => {
          setIsAiSpeaking(false);
          setSpeakingMsgId(null);
        },
        onError: () => {
          setIsAiSpeaking(false);
          setSpeakingMsgId(null);
        }
      });
    } catch (e) {
      console.warn('Speech synthesis error:', e);
      setIsAiSpeaking(false);
      setSpeakingMsgId(null);
    }
  }, [speechEnabled, voiceLanguage]);

  const stopSpeech = useCallback(() => {
    speechService.cancel();
    setIsAiSpeaking(false);
    setSpeakingMsgId(null);
  }, []);

  const handleChangeVoiceLanguage = useCallback((lang: VoiceLanguage) => {
    if (lang === voiceLanguage) return;
    speechService.unlockAudio();
    speechService.setLanguage(lang);
    setVoiceLanguage(lang);
    setIsAiSpeaking(false);
    setSpeakingMsgId(null);

    if (speechEnabled) {
      const sampleMsg =
        lang === 'hi'
          ? 'नमस्ते मुकेश, अब मैं आपसे हिंदी में बात करूँगी। बताइए आज मैं आपकी क्या मदद कर सकती हूँ?'
          : 'Hi Mukesh, I have switched to English voice. How can I assist you today?';
      speakText(sampleMsg, undefined, lang);
    }
  }, [voiceLanguage, speechEnabled, speakText]);

  // Handle successful login
  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
    // Greet user with short, natural Indian female voice upon entering
    setTimeout(() => {
      speakText('Hi Mukesh, how can I assist you today?', 'init_welcome_msg');
    }, 400);
  };

  // Reset Demo to fresh state
  const handleResetDemo = () => {
    stopSpeech();
    localStorage.removeItem('one_ai_customer_profile');
    localStorage.removeItem('one_ai_activities');
    setCustomer(INITIAL_CUSTOMER_PROFILE);
    setActivities(INITIAL_ACTIVITIES);
    const welcomeMsg: ChatMessage = {
      id: `welcome_${Date.now()}`,
      sender: 'ai',
      text: 'Hi Mukesh 👋 How can I assist you today?',
      timestamp: 'Just now',
    };
    setMessages([
      {
        id: `reset_${Date.now()}`,
        sender: 'ai',
        text: 'Demo reset completed ✓ Customer memory, accounts, and beneficiary preferences have been restored to initial baseline.',
        timestamp: 'Just now',
      },
      welcomeMsg
    ]);
    setActiveTab('chat');
    speakText('Hi Mukesh, how can I assist you today?');
  };

  // Add activity item
  const handleAddActivity = (newActivity: ActivityItem) => {
    setActivities((prev) => [newActivity, ...prev]);
  };

  // Send message handler
  const handleSendMessage = async (userInput: string) => {
    if (!userInput.trim()) return;

    speechService.unlockAudio();

    const userMsg: ChatMessage = {
      id: `user_${Date.now()}`,
      sender: 'user',
      text: userInput,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsProcessing(true);

    try {
      const aiResponse = await processUserMessage(userInput, customer, messages);
      setMessages((prev) => [...prev, aiResponse]);
      speakText(aiResponse.text, aiResponse.id);
    } catch (error) {
      const errorMsg: ChatMessage = {
        id: `err_${Date.now()}`,
        sender: 'ai',
        text: "I am ready to help. You can tell me what you need, like 'Transfer ₹5,000 to wife' or 'I need a loan'.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
      speakText(errorMsg.text, errorMsg.id);
    } finally {
      setIsProcessing(false);
    }
  };

  // Open Explainability
  const handleOpenExplainability = (contextTitle?: string) => {
    if (contextTitle) {
      setExplainabilityContext(contextTitle);
    }
    setIsExplainabilityOpen(true);
  };

  // If not authenticated, show Login Screen
  if (!isAuthenticated) {
    return (
      <LoginScreen
        customer={customer}
        onLoginSuccess={handleLoginSuccess}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col antialiased font-sans relative selection:bg-teal-500 selection:text-white">
      
      {/* Background ambient lighting */}
      <div className="fixed top-0 left-1/4 w-[500px] h-[500px] bg-teal-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="fixed bottom-0 right-1/4 w-[600px] h-[600px] bg-blue-600/5 rounded-full blur-3xl pointer-events-none" />

      {/* Global Header */}
      <Header
        customer={customer}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenGuidedTour={() => setIsGuidedTourOpen(true)}
        onOpenArchitecture={() => setIsArchitectureOpen(true)}
        onResetDemo={handleResetDemo}
        speechEnabled={speechEnabled}
        setSpeechEnabled={setSpeechEnabled}
        voiceLanguage={voiceLanguage}
        onChangeVoiceLanguage={handleChangeVoiceLanguage}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 flex flex-col z-10">
        {activeTab === 'chat' && (
          <AIChatInterface
            customer={customer}
            setCustomer={setCustomer}
            messages={messages}
            setMessages={setMessages}
            onSendMessage={handleSendMessage}
            isProcessing={isProcessing}
            onAddActivity={handleAddActivity}
            onOpenExplainability={handleOpenExplainability}
            onOpenArchitecture={() => setIsArchitectureOpen(true)}
            speechEnabled={speechEnabled}
            setSpeechEnabled={setSpeechEnabled}
            voiceLanguage={voiceLanguage}
            onChangeVoiceLanguage={handleChangeVoiceLanguage}
            isAiSpeaking={isAiSpeaking}
            speakingMsgId={speakingMsgId}
            onSpeakMessage={(text, id) => speakText(text, id)}
            onStopSpeech={stopSpeech}
          />
        )}

        {activeTab === 'activity' && (
          <ActivityTimeline
            activities={activities}
            onTriggerAction={(prompt) => {
              setActiveTab('chat');
              handleSendMessage(prompt);
            }}
          />
        )}

        {activeTab === 'offers' && (
          <PersonalizedOffers
            onSelectOfferPrompt={(prompt) => {
              setActiveTab('chat');
              handleSendMessage(prompt);
            }}
            onOpenExplainability={handleOpenExplainability}
          />
        )}

        {activeTab === 'memory' && (
          <CustomerProfileMemory
            customer={customer}
            setCustomer={setCustomer}
            onOpenExplainability={handleOpenExplainability}
          />
        )}

        {activeTab === 'security' && (
          <SecurityCenter customer={customer} />
        )}
      </main>

      {/* Floating Active Speech Player when AI Voice is talking */}
      {isAiSpeaking && (
        <div className="fixed bottom-20 right-4 sm:right-8 z-50 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="bg-slate-900/95 backdrop-blur-md border border-teal-500/50 rounded-2xl p-3 sm:px-4 sm:py-3 shadow-2xl shadow-teal-950/60 flex items-center gap-3 max-w-sm">
            {/* Animated Soundwave */}
            <div className="flex items-center gap-1 h-5 px-1">
              <span className="w-1 bg-teal-400 rounded-full animate-[bounce_1s_infinite_100ms] h-4" />
              <span className="w-1 bg-teal-300 rounded-full animate-[bounce_1s_infinite_300ms] h-5" />
              <span className="w-1 bg-blue-400 rounded-full animate-[bounce_1s_infinite_150ms] h-3" />
              <span className="w-1 bg-teal-400 rounded-full animate-[bounce_1s_infinite_250ms] h-5" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] uppercase font-bold text-teal-400 tracking-wider">
                  AI Speaking
                </span>
              </div>
              <p className="text-xs text-slate-300 truncate mt-0.5">
                {speakingSnippet || 'Reading response aloud...'}
              </p>
            </div>

            <button
              onClick={stopSpeech}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
              title="Stop Speaking"
            >
              <Square className="w-3.5 h-3.5 fill-current text-teal-400" />
            </button>
          </div>
        </div>
      )}

      {/* Modals */}
      <GuidedTourModal
        isOpen={isGuidedTourOpen}
        onClose={() => setIsGuidedTourOpen(false)}
        onJumpToChat={(prompt) => {
          setActiveTab('chat');
          if (prompt) handleSendMessage(prompt);
        }}
      />

      <ArchitectureModal
        isOpen={isArchitectureOpen}
        onClose={() => setIsArchitectureOpen(false)}
      />

      <ExplainabilityModal
        isOpen={isExplainabilityOpen}
        onClose={() => setIsExplainabilityOpen(false)}
        contextTitle={explainabilityContext}
        customer={customer}
      />
    </div>
  );
}
