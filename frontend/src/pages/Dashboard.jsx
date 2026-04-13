import React, { useState, useEffect, useContext } from 'react';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { Plus, RefreshCcw, CheckCircle, Clock, Loader2, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Dashboard = () => {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [newTask, setNewTask] = useState({ title: '', inputData: '', operation: 'uppercase' });

    const fetchTasks = async () => {
        try {
            const res = await api.get('/tasks');
            setTasks(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTasks();
        const interval = setInterval(fetchTasks, 5000); // Poll every 5 seconds
        return () => clearInterval(interval);
    }, []);

    const handleCreateTask = async (e) => {
        e.preventDefault();
        try {
            await api.post('/tasks', newTask);
            setShowModal(false);
            setNewTask({ title: '', inputData: '', operation: 'uppercase' });
            fetchTasks();
        } catch (err) {
            alert('Error creating task');
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'success': return <CheckCircle className="text-success" color="#10b981" />;
            case 'failed': return <AlertCircle color="#ef4444" />;
            case 'running': return <Loader2 className="animate-spin" color="#6366f1" />;
            default: return <Clock color="#94a3b8" />;
        }
    };

    return (
        <div style={{ padding: '0 40px' }} className="animate-fade">
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
                <div>
                    <h1 style={{ fontSize: '2.5rem', marginBottom: '8px' }}>Task Dashboard</h1>
                    <p style={{ color: 'var(--text-muted)' }}>Manage and monitor your AI processing tasks.</p>
                </div>
                <button onClick={() => setShowModal(true)} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 24px', fontSize: '1rem' }}>
                    <Plus size={20} /> Create New Task
                </button>
            </header>

            {loading ? (
                <div style={{ display: 'flex', justifyContent: 'center', marginTop: '100px' }}>
                    <Loader2 size={48} className="animate-spin" color="var(--primary)" />
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
                    {tasks.map((task) => (
                        <motion.div
                            layout
                            key={task._id}
                            className="glass-panel"
                            style={{ padding: '24px', transition: 'transform 0.2s' }}
                            whileHover={{ scale: 1.02 }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                                <h3 style={{ fontSize: '1.2rem' }}>{task.title}</h3>
                                {getStatusIcon(task.status)}
                            </div>
                            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
                                Operation: <span style={{ color: 'var(--primary)', fontWeight: '500' }}>{task.operation}</span>
                            </p>
                            <div style={{ background: 'var(--bg-dark)', padding: '12px', borderRadius: '8px', fontSize: '0.85rem' }}>
                                <p style={{ color: 'var(--text-muted)', marginBottom: '4px' }}>Input:</p>
                                <p style={{ wordBreak: 'break-all' }}>{task.inputData.substring(0, 50)}{task.inputData.length > 50 ? '...' : ''}</p>
                            </div>
                            {task.result && (
                                <div style={{ marginTop: '16px', borderTop: '1px solid var(--border)', paddingTop: '16px' }}>
                                    <p style={{ color: 'var(--accent)', fontWeight: '600' }}>Result:</p>
                                    <p style={{ fontSize: '0.9rem' }}>{task.result}</p>
                                </div>
                            )}
                            <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                    {new Date(task.createdAt).toLocaleString()}
                                </span>
                                <span className={`status-badge ${task.status}`} style={{
                                    fontSize: '0.75rem',
                                    padding: '4px 10px',
                                    borderRadius: '12px',
                                    background: task.status === 'success' ? 'rgba(16, 185, 129, 0.1)' : task.status === 'failed' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(99, 102, 241, 0.1)',
                                    color: task.status === 'success' ? '#10b981' : task.status === 'failed' ? '#ef4444' : '#6366f1'
                                }}>
                                    {task.status.toUpperCase()}
                                </span>
                            </div>
                        </motion.div>
                    ))}
                    {tasks.length === 0 && (
                        <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '100px', background: 'var(--glass)', borderRadius: '16px' }}>
                            <p style={{ color: 'var(--text-muted)', fontSize: '1.2rem' }}>No tasks found. Create your first task to get started!</p>
                        </div>
                    )}
                </div>
            )}

            {/* Modal */}
            <AnimatePresence>
                {showModal && (
                    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="glass-panel"
                            style={{ width: '500px', padding: '40px' }}
                        >
                            <h2 style={{ marginBottom: '24px' }}>Create AI Task</h2>
                            <form onSubmit={handleCreateTask}>
                                <div style={{ marginBottom: '20px' }}>
                                    <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)' }}>Task Title</label>
                                    <input
                                        type="text"
                                        className="input-field"
                                        value={newTask.title}
                                        onChange={e => setNewTask({ ...newTask, title: e.target.value })}
                                        required
                                        placeholder="E.g. Process User Feedback"
                                    />
                                </div>
                                <div style={{ marginBottom: '20px' }}>
                                    <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)' }}>Operation</label>
                                    <select
                                        className="input-field"
                                        value={newTask.operation}
                                        onChange={e => setNewTask({ ...newTask, operation: e.target.value })}
                                    >
                                        <option value="uppercase">Uppercase</option>
                                        <option value="lowercase">Lowercase</option>
                                        <option value="reverse">Reverse String</option>
                                        <option value="word_count">Word Count</option>
                                    </select>
                                </div>
                                <div style={{ marginBottom: '30px' }}>
                                    <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)' }}>Input Text</label>
                                    <textarea
                                        className="input-field"
                                        rows="4"
                                        value={newTask.inputData}
                                        onChange={e => setNewTask({ ...newTask, inputData: e.target.value })}
                                        required
                                        placeholder="Enter the text to process..."
                                    ></textarea>
                                </div>
                                <div style={{ display: 'flex', gap: '12px' }}>
                                    <button type="submit" className="btn-primary" style={{ flex: 1 }}>Run Task</button>
                                    <button type="button" onClick={() => setShowModal(false)} style={{ flex: 1, background: 'transparent', border: '1px solid var(--border)', color: 'white' }} className="btn-primary">Cancel</button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Dashboard;
