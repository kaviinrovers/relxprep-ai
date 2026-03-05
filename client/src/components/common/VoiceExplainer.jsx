import { useState } from 'react';
import { Volume2, VolumeX, Globe } from 'lucide-react';

export default function VoiceExplainer({ text }) {
    const [speaking, setSpeaking] = useState(false);
    const [lang, setLang] = useState('en-US');

    const speak = () => {
        if (!text) return;

        if (speaking) {
            speechSynthesis.cancel();
            setSpeaking(false);
            return;
        }

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = lang;
        utterance.rate = 0.9;
        utterance.pitch = 1;

        utterance.onend = () => setSpeaking(false);
        utterance.onerror = () => setSpeaking(false);

        speechSynthesis.speak(utterance);
        setSpeaking(true);
    };

    return (
        <div className="flex items-center gap-2">
            <button
                onClick={speak}
                className={`p-2 rounded-lg transition-all ${speaking
                        ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                        : 'bg-brand-500/20 text-brand-400 hover:bg-brand-500/30'
                    }`}
                title={speaking ? 'Stop' : 'Listen'}
            >
                {speaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
            <button
                onClick={() => setLang(lang === 'en-US' ? 'ta-IN' : 'en-US')}
                className="p-2 rounded-lg bg-white/5 text-white/40 hover:text-white hover:bg-white/10 transition-all flex items-center gap-1"
                title={`Switch to ${lang === 'en-US' ? 'Tamil' : 'English'}`}
            >
                <Globe className="w-3.5 h-3.5" />
                <span className="text-xs">{lang === 'en-US' ? 'EN' : 'TA'}</span>
            </button>
        </div>
    );
}
