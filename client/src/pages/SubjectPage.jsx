import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { FileText, Send, Bot, User, Book } from 'lucide-react';
import { api } from '../lib/api';

export default function SubjectPage() {
    const { id } = useParams();
    const [subject, setSubjects] = useState([]); // In a real app we'd fetch specific subject info too
    const [resources, setResources] = useState([]);

    // Chat State
    const [messages, setMessages] = useState([
        { role: 'ai', text: 'Hello! I am your AI assistant for this subject. Ask me anything about the uploaded notes.' }
    ]);
    const [query, setQuery] = useState('');
    const [loading, setLoading] = useState(false);
    const scrollRef = useRef(null);

    useEffect(() => {
        if (id) {
            api.getResources(id).then(setResources);
            // Hack: we get all subjects to find name, ideally fetch one
            api.getSubjects().then(subs => {
                const sub = subs.find(s => s.id === parseInt(id));
                if (sub) setSubjects(sub);
            });
        }
    }, [id]);

    useEffect(() => {
        if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }, [messages]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!query.trim()) return;

        const userMsg = { role: 'user', text: query };
        setMessages(prev => [...prev, userMsg]);
        setQuery('');
        setLoading(true);

        try {
            const data = await api.askAI(userMsg.text, id);
            setMessages(prev => [...prev, { role: 'ai', text: data.answer }]);
        } catch (err) {
            setMessages(prev => [...prev, { role: 'ai', text: 'Sorry, I encountered an error.' }]);
        } finally {
            setLoading(false);
        }
    };

    const getIcon = (type) => {
        if (type === 'question_bank') return <FileText size={40} color="#ec4899" />;
        if (type === 'reference_book') return <Book size={40} color="#8b5cf6" />;
        return <FileText size={40} color="#3b82f6" />;
    };

    return (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '30px', height: 'calc(100vh - 64px)' }}>
            {/* Left: Resources */}
            <div style={{ overflowY: 'auto' }}>
                <h1 style={{ fontSize: '2rem', marginBottom: '10px' }}>{subject.name || 'Subject Resources'}</h1>
                <p style={{ color: 'var(--text-muted)', marginBottom: '30px' }}>{subject.code} • Semester {subject.semester}</p>

                <h3 style={{ borderBottom: '1px solid var(--glass-border)', paddingBottom: '10px' }}>Study Materials</h3>

                <div className="card-grid">
                    {resources.length === 0 ? <p>No resources uploaded yet.</p> : resources.map(res => (
                        <div key={res.id} className="resource-card glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                {getIcon(res.type)}
                                <span className="badge">{res.type.replace('_', ' ')}</span>
                            </div>
                            <div>
                                <h4 style={{ margin: '0 0 5px 0' }}>{res.title}</h4>
                                <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                    Uploaded {new Date(res.created_at).toLocaleDateString()}
                                </p>
                            </div>
                            <a href={res.file_url} download className="btn-primary" style={{ textAlign: 'center', textDecoration: 'none', fontSize: '0.9rem' }}>
                                Download PDF
                            </a>
                        </div>
                    ))}
                </div>
            </div>

            {/* Right: AI Chat */}
            <div className="glass-panel chat-container">
                <div style={{ padding: '20px', borderBottom: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.02)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Bot size={24} color="var(--primary)" />
                        <h3 style={{ margin: 0 }}>Subject Agent</h3>
                    </div>
                </div>

                <div className="chat-messages" ref={scrollRef}>
                    {messages.map((m, i) => (
                        <div key={i} className={`message ${m.role}`}>
                            {m.text}
                        </div>
                    ))}
                    {loading && (
                        <div className="message ai typing-indicator">
                            <span></span><span></span><span></span>
                        </div>
                    )}
                </div>

                <form onSubmit={handleSend} className="chat-input-area">
                    <input
                        className="glass-input"
                        placeholder="Ask about these documents..."
                        value={query}
                        onChange={e => setQuery(e.target.value)}
                    />
                    <button type="submit" className="btn-primary" style={{ padding: '0 12px' }}>
                        <Send size={20} />
                    </button>
                </form>
            </div>
        </div>
    );
}
