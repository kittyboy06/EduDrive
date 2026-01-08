import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import AdminPage from './pages/AdminPage';
import SubjectPage from './pages/SubjectPage';

function WelcomePage() {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', textAlign: 'center' }}>
            <h1 style={{ fontSize: '3rem', background: 'linear-gradient(to right, #8b5cf6, #ec4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', margin: '0 0 20px 0' }}>
                Welcome to EduDrive
            </h1>
            <p style={{ maxWidth: '600px', color: 'var(--text-muted)', fontSize: '1.2rem', lineHeight: '1.6' }}>
                Select a semester and subject from the sidebar to access resources
                and chat with the AI Agent.
            </p>
        </div>
    );
}

function App() {
    return (
        <BrowserRouter>
            <div className="app-container">
                <Sidebar />
                <main className="main-content">
                    <Routes>
                        <Route path="/" element={<WelcomePage />} />
                        <Route path="/admin" element={<AdminPage />} />
                        <Route path="/subject/:id" element={<SubjectPage />} />
                        <Route path="*" element={<Navigate to="/" />} />
                    </Routes>
                </main>
            </div>
        </BrowserRouter>
    );
}

export default App;
