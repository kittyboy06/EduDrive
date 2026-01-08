import React, { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { BookOpen, ShieldCheck, ChevronRight, GraduationCap } from 'lucide-react';
import { api } from '../lib/api';

export default function Sidebar() {
    const [subjects, setSubjects] = useState([]);
    const [openSemester, setOpenSemester] = useState(null);

    useEffect(() => {
        api.getSubjects().then(setSubjects);
    }, []);

    const semesters = [3, 4, 5, 6, 7, 8];

    const getSubjectsForSemester = (sem) => subjects.filter(s => s.semester === sem);

    return (
        <div className="sidebar glass-panel">
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                <div style={{ background: 'var(--primary)', padding: '8px', borderRadius: '8px' }}>
                    <GraduationCap size={24} color="white" />
                </div>
                <h2 style={{ margin: 0, fontWeight: 700, fontSize: '1.2rem' }}>EduDrive</h2>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <NavLink to="/admin" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <ShieldCheck size={18} />
                        Admin Panel
                    </div>
                </NavLink>

                <div style={{ marginTop: '16px', textTransform: 'uppercase', fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, paddingLeft: '16px', marginBottom: '8px' }}>
                    Semesters
                </div>

                {semesters.map(sem => (
                    <div key={sem}>
                        <div
                            className="nav-item"
                            onClick={() => setOpenSemester(openSemester === sem ? null : sem)}
                            style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                        >
                            <span>Semester {sem}</span>
                            <ChevronRight size={16}
                                style={{ transform: openSemester === sem ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}
                            />
                        </div>

                        {openSemester === sem && (
                            <div style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '2px', animation: 'fadeIn 0.2s' }}>
                                {getSubjectsForSemester(sem).length === 0 ? (
                                    <div style={{ padding: '8px 16px', fontSize: '0.8rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                                        No subjects
                                    </div>
                                ) : (
                                    getSubjectsForSemester(sem).map(sub => (
                                        <NavLink
                                            key={sub.id}
                                            to={`/subject/${sub.id}`}
                                            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                                            style={{ fontSize: '0.9rem' }}
                                        >
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <BookOpen size={14} />
                                                {sub.code}
                                            </div>
                                        </NavLink>
                                    ))
                                )}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
