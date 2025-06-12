// frontend/src/components/FeedbackSection.js
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom'; // Import Link
import './FeedbackSection.css';

function FeedbackSection({ moduleName }) {
    const { user, isAuthenticated } = useAuth(); // 'user' object now contains {id, username}
    const [feedbackList, setFeedbackList] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const fetchFeedback = async () => {
        try {
            const response = await fetch(`http://localhost:8080/api/feedback/${moduleName}`);
            const data = await response.json();
            if (response.ok) {
                setFeedbackList(data);
            }
        } catch (err) {
            setError('Could not load feedback.');
        }
    };

    useEffect(() => {
        fetchFeedback();
    }, [moduleName]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!newComment.trim() || !isAuthenticated) return;
        setIsLoading(true);
        setError('');

        try {
            const response = await fetch('http://localhost:8080/api/feedback', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                // Include the moduleName and userId in the request body
                body: JSON.stringify({ moduleName, content: newComment, userId: user.id }),
            });
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || 'Failed to post comment.');
            }
            setNewComment('');
            fetchFeedback(); // Refresh the list
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (feedbackId) => {
        if (!window.confirm('Are you sure you want to delete this comment?')) return;
        setError('');

        try {
            // Send the current user's ID as a query parameter for verification on the backend
            const response = await fetch(`http://localhost:8080/api/feedback/${feedbackId}?userId=${user.id}`, {
                method: 'DELETE',
            });
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || 'You do not have permission to delete this.');
            }
            fetchFeedback(); // Refresh the list
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div className="feedback-section">
            <hr />
            <h3>Feedback & Comments</h3>
            {isAuthenticated ? (
                <form onSubmit={handleSubmit} className="feedback-form">
                    <textarea
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder={`Leave your feedback as ${user.username}...`}
                        rows="3"
                        required
                    />
                    <button type="submit" disabled={isLoading}>{isLoading ? 'Posting...' : 'Post Comment'}</button>
                </form>
            ) : (
                <p>Please <Link to="/login">log in</Link> to leave feedback.</p>
            )}

            {error && <p className="error-message">{error}</p>}

            <div className="feedback-list">
                {feedbackList.map(fb => (
                    <div key={fb.id} className="feedback-item">
                        <p className="feedback-content">{fb.content}</p>
                        <div className="feedback-meta">
                            <span>by <strong>{fb.username}</strong> on {new Date(fb.createdAt).toLocaleDateString()}</span>
                            {isAuthenticated && user?.id === fb.userId && (
                                <button onClick={() => handleDelete(fb.id)} className="delete-btn">Delete</button>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default FeedbackSection;