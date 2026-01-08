import React, { useState, useEffect } from 'react';
import { api } from '../lib/api';

export default function AdminPage() {
    const [subjects, setSubjects] = useState([]);

    // Subject Form State
    const [subName, setSubName] = useState('');
    const [subCode, setSubCode] = useState('');
    const [semester, setSemester] = useState(3);

    // Resource Form State
    const [selectedSub, setSelectedSub] = useState('');
    const [resTitle, setResTitle] = useState('');
    const [resType, setResType] = useState('lesson_pdf');
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadSubjects();
    }, []);

    const loadSubjects = () => api.getSubjects().then(setSubjects);

    const handleCreateSubject = async (e) => {
        e.preventDefault();
        await api.createSubject({ name: subName, code: subCode, semester: parseInt(semester) });
        alert('Subject Created!');
        setSubName(''); setSubCode('');
        loadSubjects();
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!file || !selectedSub) return alert('Select file and subject');

        setLoading(true);
        const formData = new FormData();
        formData.append('subject_id', selectedSub);
        formData.append('title', resTitle);
        formData.append('type', resType);
        formData.append('file', file);

        try {
            await api.uploadResource(formData);
            alert('Resource Uploaded & Processed!');
            setResTitle(''); setFile(null);
        } catch (err) {
            alert('Upload failed: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <h1 style={{ marginBottom: '30px' }}>Admin Dashboard</h1>

            <div className="glass-panel" style={{ padding: '30px', marginBottom: '30px' }}>
                <h2 style={{ marginTop: 0 }}>Create New Subject</h2>
                <form onSubmit={handleCreateSubject} style={{ display: 'grid', gap: '20px', gridTemplateColumns: '1fr 1fr' }}>
                    <input className="glass-input" placeholder="Subject Name (e.g. Data Structures)" value={subName} onChange={e => setSubName(e.target.value)} required />
                    <input className="glass-input" placeholder="Subject Code (e.g. CS301)" value={subCode} onChange={e => setSubCode(e.target.value)} required />
                    <select className="glass-input" value={semester} onChange={e => setSemester(e.target.value)}>
                        {[3, 4, 5, 6, 7, 8].map(s => <option key={s} value={s} style={{ color: 'black' }}>Semester {s}</option>)}
                    </select>
                    <button type="submit" className="btn-primary" style={{ gridColumn: 'span 2' }}>Create Subject</button>
                </form>
            </div>

            <div className="glass-panel" style={{ padding: '30px' }}>
                <h2 style={{ marginTop: 0 }}>Upload Resource</h2>
                <form onSubmit={handleUpload} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <select className="glass-input" value={selectedSub} onChange={e => setSelectedSub(e.target.value)} required>
                        <option value="" style={{ color: 'black' }}>Select Subject</option>
                        {subjects.map(s => (
                            <option key={s.id} value={s.id} style={{ color: 'black' }}>{s.code} - {s.name}</option>
                        ))}
                    </select>

                    <input className="glass-input" placeholder="Resource Title" value={resTitle} onChange={e => setResTitle(e.target.value)} required />

                    <select className="glass-input" value={resType} onChange={e => setResType(e.target.value)}>
                        <option value="lesson_pdf" style={{ color: 'black' }}>Lesson PDF</option>
                        <option value="question_bank" style={{ color: 'black' }}>Question Bank</option>
                        <option value="reference_book" style={{ color: 'black' }}>Reference Book</option>
                    </select>

                    <div style={{ border: '2px dashed var(--glass-border)', padding: '20px', borderRadius: '8px', textAlign: 'center' }}>
                        <input type="file" onChange={e => setFile(e.target.files[0])} accept=".pdf" />
                        <p style={{ margin: '10px 0 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                            Supports PDF. Scanned files will use OCR.
                        </p>
                    </div>

                    <button type="submit" className="btn-primary" disabled={loading}>
                        {loading ? 'Processing & Extracting...' : 'Upload Resource'}
                    </button>
                </form>
            </div>
        </div>
    );
}
