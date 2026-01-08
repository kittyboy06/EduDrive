const API_BASE = '/api';

export const api = {
    getSubjects: async (semester) => {
        const params = semester ? `?semester=${semester}` : '';
        const res = await fetch(`${API_BASE}/subjects${params}`);
        return res.json();
    },

    createSubject: async (data) => {
        const res = await fetch(`${API_BASE}/subjects`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        return res.json();
    },

    getResources: async (subjectId) => {
        const res = await fetch(`${API_BASE}/resources/${subjectId}`);
        return res.json();
    },

    uploadResource: async (formData) => {
        const res = await fetch(`${API_BASE}/resources`, {
            method: 'POST',
            body: formData
        });
        return res.json();
    },

    askAI: async (query, subjectId) => {
        const res = await fetch(`${API_BASE}/chat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query, subjectId })
        });
        return res.json();
    }
};
