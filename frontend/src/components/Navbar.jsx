import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Cpu, LogOut, User } from 'lucide-react';

const Navbar = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav className="glass-panel" style={{ margin: '20px', padding: '15px 30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--primary)' }}>
                <Cpu size={32} />
                <span>TaskAI</span>
            </Link>

            <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                {user ? (
                    <>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)' }}>
                            <User size={18} />
                            <span>{user.username}</span>
                        </div>
                        <button onClick={handleLogout} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px' }}>
                            <LogOut size={18} /> Logout
                        </button>
                    </>
                ) : (
                    <>
                        <Link to="/login" style={{ color: 'var(--text-main)' }}>Login</Link>
                        <Link to="/register" className="btn-primary">Get Started</Link>
                    </>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
