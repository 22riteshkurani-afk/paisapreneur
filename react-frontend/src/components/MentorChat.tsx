import React, { useState, useEffect, useRef } from 'react';
import { UserProfile, ChatMessage } from '../types';
import { getMentorResponse, textToSpeech, connectMentorLive } from '../services/geminiService';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { collection, addDoc, query, orderBy, onSnapshot, Timestamp } from 'firebase/firestore';
import ReactMarkdown from 'react-markdown';
import { Send, Mic, MicOff, Volume2, VolumeX, Bot, User, Loader2, Sparkles, Phone, PhoneOff } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { hasReachedLimit, incrementGenerations } from '../lib/limits';
import { LimitModal } from './LimitModal';

interface MentorChatProps {
  userProfile: UserProfile;
}

export const MentorChat: React.FC<MentorChatProps> = ({ userProfile }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isLive, setIsLive] = useState(false);
  const [autoSpeak, setAutoSpeak] = useState(false);
  const [showLimitModal, setShowLimitModal] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const liveSessionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioStreamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    const q = query(
      collection(db, 'users', userProfile.uid, 'chat'),
      orderBy('timestamp', 'asc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ChatMessage));
      setMessages(msgs);
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'chat'));

    return () => unsubscribe();
  }, [userProfile.uid]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    if (hasReachedLimit(userProfile)) {
      setShowLimitModal(true);
      return;
    }

    const userMsg: Omit<ChatMessage, 'id'> = {
      userId: userProfile.uid,
      role: 'user',
      text: input.trim(),
      timestamp: Date.now()
    };

    setInput('');
    setIsLoading(true);

    try {
      await addDoc(collection(db, 'users', userProfile.uid, 'chat'), userMsg);
      
      const history = messages.map(m => ({ role: m.role, text: m.text }));
      const responseText = await getMentorResponse(history, userMsg.text);

      const modelMsg: Omit<ChatMessage, 'id'> = {
        userId: userProfile.uid,
        role: 'model',
        text: responseText,
        timestamp: Date.now()
      };

      await addDoc(collection(db, 'users', userProfile.uid, 'chat'), modelMsg);
      await incrementGenerations(userProfile.uid);
      
      if (autoSpeak) {
        handleSpeak(responseText);
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'chat');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSpeak = async (text: string) => {
    if (isSpeaking) {
      audioRef.current?.pause();
      setIsSpeaking(false);
      return;
    }

    setIsSpeaking(true);
    try {
      const base64 = await textToSpeech(text);
      if (base64) {
        const audio = new Audio(`data:audio/mp3;base64,${base64}`);
        audioRef.current = audio;
        audio.onended = () => setIsSpeaking(false);
        audio.play();
      }
    } catch (error) {
      console.error('Speech error:', error);
      setIsSpeaking(false);
    }
  };

  const startListening = () => {
    if (!('webkitSpeechRecognition' in window)) {
      alert('Speech recognition not supported in this browser.');
      return;
    }

    const recognition = new (window as any).webkitSpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-IN';

    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
      setIsListening(false);
    };
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);

    recognition.start();
  };

  const toggleLiveMode = async () => {
    if (isLive) {
      liveSessionRef.current?.close();
      audioStreamRef.current?.getTracks().forEach(t => t.stop());
      audioContextRef.current?.close();
      setIsLive(false);
      return;
    }

    setIsLive(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioStreamRef.current = stream;
      
      const audioContext = new AudioContext({ sampleRate: 16000 });
      audioContextRef.current = audioContext;
      const source = audioContext.createMediaStreamSource(stream);
      const processor = audioContext.createScriptProcessor(4096, 1, 1);

      const sessionPromise = connectMentorLive({
        onopen: () => {
          source.connect(processor);
          processor.connect(audioContext.destination);
        },
        onmessage: (message: any) => {
          const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
          if (base64Audio) {
            const binary = atob(base64Audio);
            const bytes = new Uint8Array(binary.length);
            for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
            const floatData = new Float32Array(bytes.buffer);
            
            const buffer = audioContext.createBuffer(1, floatData.length, 16000);
            buffer.copyToChannel(floatData, 0);
            const playSource = audioContext.createBufferSource();
            playSource.buffer = buffer;
            playSource.connect(audioContext.destination);
            playSource.start();
          }
        },
        onclose: () => setIsLive(false),
        onerror: (e: any) => {
          console.error('Live error:', e);
          setIsLive(false);
        }
      });

      processor.onaudioprocess = (e) => {
        const inputData = e.inputBuffer.getChannelData(0);
        // Convert to 16-bit PCM
        const pcmData = new Int16Array(inputData.length);
        for (let i = 0; i < inputData.length; i++) {
          pcmData[i] = Math.max(-1, Math.min(1, inputData[i])) * 0x7FFF;
        }
        const base64 = btoa(String.fromCharCode(...new Uint8Array(pcmData.buffer)));
        sessionPromise.then(session => {
          session.sendRealtimeInput({
            audio: { data: base64, mimeType: 'audio/pcm;rate=16000' }
          });
        });
      };

      liveSessionRef.current = await sessionPromise;
    } catch (error) {
      console.error('Live mode error:', error);
      setIsLive(false);
    }
  };

  return (
    <div className="h-[calc(100vh-120px)] flex flex-col bg-zinc-900/30 border border-zinc-800 rounded-3xl overflow-hidden backdrop-blur-xl">
      {/* Chat Header */}
      <div className="p-6 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/50">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center border border-emerald-500/20">
            <Bot className="w-6 h-6 text-emerald-500" />
          </div>
          <div>
            <h2 className="font-bold text-lg">AI Startup Mentor</h2>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              <span className="text-xs text-zinc-400 font-medium">Online • Ready to execute</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={toggleLiveMode}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-xl border transition-all font-bold text-sm",
              isLive ? "bg-red-500 text-white border-red-600 animate-pulse" : "bg-emerald-500/10 border-emerald-500/30 text-emerald-500 hover:bg-emerald-500/20"
            )}
          >
            {isLive ? <PhoneOff className="w-4 h-4" /> : <Phone className="w-4 h-4" />}
            {isLive ? "End Live Call" : "Live Voice Mode"}
          </button>
          <button
            onClick={() => setAutoSpeak(!autoSpeak)}
            className={cn(
              "p-3 rounded-xl border transition-all",
              autoSpeak ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-500" : "bg-zinc-800 border-zinc-700 text-zinc-400"
            )}
            title="Auto-speak responses"
          >
            {autoSpeak ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Messages Area */}
      <div 
        ref={scrollRef}
        className="flex-grow overflow-y-auto p-6 space-y-6 scroll-smooth"
      >
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center opacity-50">
            <Sparkles className="w-12 h-12 text-zinc-700 mb-4" />
            <p className="text-zinc-500 max-w-xs">Ask me anything about your business, marketing, or scaling. I'm here to help you win.</p>
          </div>
        )}
        {messages.map((msg) => (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            key={msg.id}
            className={cn(
              "flex gap-4 max-w-[85%]",
              msg.role === 'user' ? "ml-auto flex-row-reverse" : "mr-auto"
            )}
          >
            <div className={cn(
              "w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0",
              msg.role === 'user' ? "bg-zinc-800" : "bg-emerald-500/10 border border-emerald-500/20"
            )}>
              {msg.role === 'user' ? <User className="w-5 h-5 text-zinc-400" /> : <Bot className="w-5 h-5 text-emerald-500" />}
            </div>
            <div className="space-y-2">
              <div className={cn(
                "p-4 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap prose prose-invert prose-sm max-w-none",
                msg.role === 'user' ? "bg-emerald-600 text-white rounded-tr-none" : "bg-zinc-800/50 text-zinc-300 rounded-tl-none border border-zinc-700/50"
              )}>
                <ReactMarkdown>{msg.text}</ReactMarkdown>
              </div>
              {msg.role === 'model' && (
                <button
                  onClick={() => handleSpeak(msg.text)}
                  className="text-[10px] uppercase font-bold tracking-widest text-zinc-500 hover:text-emerald-500 transition-colors flex items-center gap-1"
                >
                  <Volume2 className="w-3 h-3" /> Listen
                </button>
              )}
            </div>
          </motion.div>
        ))}
        {isLoading && (
          <div className="flex gap-4 mr-auto max-w-[85%]">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
              <Loader2 className="w-5 h-5 text-emerald-500 animate-spin" />
            </div>
            <div className="bg-zinc-800/50 border border-zinc-700/50 p-4 rounded-2xl rounded-tl-none">
              <div className="flex gap-1">
                <span className="w-1.5 h-1.5 bg-zinc-600 rounded-full animate-bounce [animation-delay:-0.3s]" />
                <span className="w-1.5 h-1.5 bg-zinc-600 rounded-full animate-bounce [animation-delay:-0.15s]" />
                <span className="w-1.5 h-1.5 bg-zinc-600 rounded-full animate-bounce" />
              </div>
            </div>
          </div>
        )}
      </div>


      {/* Input Area */}
      <div className="p-6 bg-zinc-900/50 border-t border-zinc-800">
        <div className="flex gap-3 items-center">
          <button
            onClick={startListening}
            className={cn(
              "p-4 rounded-2xl border transition-all active:scale-95",
              isListening ? "bg-red-500/10 border-red-500/30 text-red-500 animate-pulse" : "bg-zinc-800 border-zinc-700 text-zinc-400 hover:text-white"
            )}
          >
            {isListening ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
          </button>
          <div className="flex-grow relative">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask your mentor..."
              className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl px-6 py-4 pr-14 focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className={cn(
                "absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-xl transition-all",
                !input.trim() || isLoading ? "text-zinc-700" : "text-emerald-500 hover:bg-emerald-500/10"
              )}
            >
              <Send className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>
      <LimitModal isOpen={showLimitModal} onClose={() => setShowLimitModal(false)} />
    </div>
  );
};
