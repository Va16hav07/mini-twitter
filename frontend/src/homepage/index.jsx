import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Homepage = () => {
    const [notes, setNotes] = useState([]);
    const [error, setError] = useState('');
    const [content, setContent] = useState('');
    const navigate = useNavigate();
    const [currentUser, setCurrentUser] = useState('');
    const [likedNotes, setLikedNotes] = useState({});
    
    useEffect(() => {
        const token = localStorage.getItem('token');
        const user = localStorage.getItem('user');
        if (!token) {
            navigate('/signin');
            return;
        }
        
        if (user) {
            try {
                const userData = JSON.parse(user);
                setCurrentUser(userData.username);
                
                const savedLikedNotes = localStorage.getItem('likedNotes');
                if (savedLikedNotes) {
                    setLikedNotes(JSON.parse(savedLikedNotes));
                }
            } catch (err) {
                console.error('Error parsing user data:', err);
            }
        }
        
        fetchNotes();
    }, [navigate]);
    
    const fetchNotes = async () => {
        try {
            const token = localStorage.getItem('token');
            
            if (!token) {
                setError('No authentication token found');
                return;
            }
            
            const res = await fetch('http://localhost:3000/api/notes', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                }
            });
            
            if (res.ok) {
                const data = await res.json();
                setNotes(data);
            } else {
                const errorData = await res.json();
                setError(errorData.error || 'Failed to fetch notes');
                console.error('Error fetching notes:', errorData);
                
                if (res.status === 401) {
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    navigate('/signin');
                }
            }
        } catch (err) {
            setError('Error connecting to the server');
            console.error('Error:', err);
        }
    };
    
    const handleNewNote = async (e) => {
        e.preventDefault();
        if (!content.trim()) return;
        
        const token = localStorage.getItem('token');
        try {
            const res = await fetch('http://localhost:3000/api/notes', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ content })
            });
            
            if (res.ok) {
                setContent('');
                fetchNotes(); 
            } else {
                const errorData = await res.json();
                setError(errorData.error || 'Failed to create note');
            }
        } catch (err) {
            setError('Error connecting to the server');
            console.error('Error:', err);
        }
    };
    
    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/signin');
    };
    
    const handleLike = async (id) => {
        try {
            const token = localStorage.getItem('token');
            let endpoint;
            let action;
            
            if (likedNotes[id]) {
                endpoint = `http://localhost:3000/api/notes/${id}/unlike`;
                action = 'unlike';
            } else {
                endpoint = `http://localhost:3000/api/notes/${id}/like`;
                action = 'like';
            }
            
            const res = await fetch(endpoint, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (res.ok) {
                const updatedLikedNotes = { ...likedNotes };
                
                if (action === 'like') {
                    updatedLikedNotes[id] = true;
                } else {
                    delete updatedLikedNotes[id];
                }
                
                setLikedNotes(updatedLikedNotes);
                localStorage.setItem('likedNotes', JSON.stringify(updatedLikedNotes));
                fetchNotes();
            } else {
                const errorData = await res.json();
                setError(errorData.error || `Failed to ${action} note`);
            }
        } catch (err) {
            setError('Error connecting to the server');
            console.error('Error:', err);
        }
    };
    
    const handleDelete = async (id) => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`http://localhost:3000/api/notes/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (res.ok) {
                fetchNotes(); 
            } else {
                const errorData = await res.json();
                setError(errorData.error || 'Failed to delete note');
            }
        } catch (err) {
            setError('Error connecting to the server');
            console.error('Error:', err);
        }
    };
    
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleString();
    };
    
    return (
        <div className="container">
            <div style={{alignItems: 'center', marginBottom: '20px' }}>
                <h1>Mini Twitter</h1>
                <button onClick={handleLogout}>
                    Logout
                </button>
            </div>
            
            {error && <p style={{ color: 'red', padding: '10px', backgroundColor: '#ffe6e6', borderRadius: '5px' }}>{error}</p>}
            
            <form onSubmit={handleNewNote} style={{ marginBottom: '20px' }}>
                <textarea
                    placeholder="What's happening?"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                ></textarea>
                <div style={{ textAlign: 'right' }}>
                    <button type ="submit">
                        Tweet
                    </button>
                </div>
            </form>
            
            {notes.length > 0 ? (
                <div>
                    {notes.map(note => (
                        <div key={note._id}>
                            <p style={{ fontSize: '16px', marginBottom: '10px' }}>{note.content}</p>
                            <small style={{ color: '#555', fontWeight: 'bold' }}>@{note.author}</small><br />
                            <div style={{alignItems: 'center', marginTop: '10px' }}>
                                <button 
                                    onClick={() => handleLike(note._id)} 
                                    
                                >
                                    {likedNotes[note._id] ? 'liked' : 'like'}
                                </button>
                                <span>{note.likes}</span>
                            </div>
                            <small>
                                Posted: {formatDate(note.createdAt)}
                            </small>
                            
                            {note.author === currentUser && (
                                <div style={{ marginTop: '10px' }}>
                                    <button 
                                        onClick={() => handleDelete(note._id)}
                                    >
                                        Delete
                                    </button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            ) : !error && <p>No tweets yet</p>}
        </div>
    );
};

export default Homepage;