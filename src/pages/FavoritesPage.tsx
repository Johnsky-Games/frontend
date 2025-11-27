import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, MapPin, Star, Calendar, Trash2 } from 'lucide-react';
import ApiService from '../services/ApiService';
import { toast } from 'react-toastify';
import StarRating from '../components/StarRating';
import './FavoritesPage.css';

interface FavoriteBusiness {
    id: number;
    name: string;
    category: string;
    address: string;
    city: string;
    phone: string;
    average_rating: number;
    total_ratings: number;
    review_count: number;
    favorited_at: string;
}

const FavoritesPage: React.FC = () => {
    const navigate = useNavigate();
    const [favorites, setFavorites] = useState<FavoriteBusiness[]>([]);
    const [loading, setLoading] = useState(true);
    const [removing, setRemoving] = useState<number | null>(null);

    useEffect(() => {
        fetchFavorites();
    }, []);

    const fetchFavorites = async () => {
        try {
            const response = await ApiService.get('/favorites');
            // Backend returns { code: 'SUCCESS', data: [...] }
            setFavorites(response.data.data || []);
        } catch (error) {
            console.error('Error fetching favorites:', error);
            toast.error('Failed to load favorites');
        } finally {
            setLoading(false);
        }
    };

    const handleRemove = async (businessId: number) => {
        setRemoving(businessId);

        try {
            await ApiService.delete(`/favorites/${businessId}`);
            setFavorites(favorites.filter((fav) => fav.id !== businessId));
            toast.success('Removed from favorites');
        } catch (error) {
            console.error('Error removing favorite:', error);
            toast.error('Failed to remove from favorites');
        } finally {
            setRemoving(null);
        }
    };

    const handleBookNow = (businessId: number) => {
        navigate(`/businesses/${businessId}`);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    if (loading) {
        return (
            <div className="favorites-page">
                <div className="favorites-loading">
                    <div className="favorites-spinner"></div>
                    <p>Loading your favorites...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="favorites-page">
            <div className="favorites-header">
                <div className="favorites-title-section">
                    <Heart className="favorites-icon" size={32} />
                    <h1 className="favorites-title">My Favorites</h1>
                </div>
                <p className="favorites-subtitle">
                    {favorites.length === 0
                        ? 'You haven\'t added any favorites yet'
                        : `${favorites.length} ${favorites.length === 1 ? 'business' : 'businesses'
                        } saved`}
                </p>
            </div>

            {favorites.length === 0 ? (
                <div className="favorites-empty">
                    <Heart className="favorites-empty-icon" size={64} />
                    <h2>No Favorites Yet</h2>
                    <p>
                        Start exploring and add your favorite businesses to easily find them
                        later.
                    </p>
                    <button
                        className="favorites-explore-btn"
                        onClick={() => navigate('/explore')}
                    >
                        Explore Businesses
                    </button>
                </div>
            ) : (
                <div className="favorites-grid">
                    {Array.isArray(favorites) && favorites.map((business) => (
                        <div key={business.id} className="favorite-card">
                            <div className="favorite-card-header">
                                <div>
                                    <h3 className="favorite-card-name">{business.name}</h3>
                                    <span className="favorite-card-category">
                                        {business.category}
                                    </span>
                                </div>
                                <button
                                    className="favorite-card-remove"
                                    onClick={() => handleRemove(business.id)}
                                    disabled={removing === business.id}
                                    title="Remove from favorites"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>

                            <div className="favorite-card-rating">
                                <StarRating
                                    rating={business.average_rating || 0}
                                    readonly
                                    size="sm"
                                    showCount
                                    count={business.review_count}
                                />
                            </div>

                            <div className="favorite-card-info">
                                <div className="favorite-card-info-item">
                                    <MapPin size={16} />
                                    <span>
                                        {business.address}, {business.city}
                                    </span>
                                </div>
                                <div className="favorite-card-info-item">
                                    <Calendar size={16} />
                                    <span>Added {formatDate(business.favorited_at)}</span>
                                </div>
                            </div>

                            <div className="favorite-card-actions">
                                <button
                                    className="favorite-card-btn favorite-card-btn--primary"
                                    onClick={() => handleBookNow(business.id)}
                                >
                                    Book Appointment
                                </button>
                                <button
                                    className="favorite-card-btn favorite-card-btn--secondary"
                                    onClick={() => navigate(`/businesses/${business.id}`)}
                                >
                                    View Details
                                </button>
                            </div>
                        </div >
                    ))}
                </div >
            )}
        </div >
    );
};

export default FavoritesPage;
