import React, { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import ApiService from '../services/ApiService';
import { toast } from 'react-toastify';
import './FavoriteButton.css';

interface FavoriteButtonProps {
    businessId: number;
    size?: 'sm' | 'md' | 'lg';
    showLabel?: boolean;
    onToggle?: (isFavorite: boolean) => void;
}

const FavoriteButton: React.FC<FavoriteButtonProps> = ({
    businessId,
    size = 'md',
    showLabel = false,
    onToggle
}) => {
    const [isFavorite, setIsFavorite] = useState(false);
    const [loading, setLoading] = useState(false);
    const [checking, setChecking] = useState(true);

    useEffect(() => {
        checkFavoriteStatus();
    }, [businessId]);

    const checkFavoriteStatus = async () => {
        try {
            const response = await ApiService.get(
                `/favorites/check/${businessId}`
            );
            // Backend returns { code: 'SUCCESS', data: { is_favorite: boolean } }
            setIsFavorite(response.data.data.is_favorite);
        } catch (error) {
            console.error('Error checking favorite status:', error);
        } finally {
            setChecking(false);
        }
    };

    const handleToggle = async () => {
        if (loading) return;

        setLoading(true);

        try {
            const response = await ApiService.post('/favorites/toggle', {
                business_id: businessId
            });

            // Backend returns { code: 'SUCCESS', data: { favorited: boolean } }
            const newStatus = response.data.data.favorited;
            setIsFavorite(newStatus);

            toast.success(
                newStatus
                    ? 'Added to favorites'
                    : 'Removed from favorites'
            );

            if (onToggle) {
                onToggle(newStatus);
            }
        } catch (error: any) {
            console.error('Error toggling favorite:', error);
            const errorMessage =
                error.response?.data?.message ||
                'Failed to update favorites. Please try again.';
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    if (checking) {
        return null; // or a loading skeleton
    }

    const sizeClasses = {
        sm: 'favorite-btn--sm',
        md: 'favorite-btn--md',
        lg: 'favorite-btn--lg'
    };

    return (
        <button
            className={`favorite-btn ${sizeClasses[size]} ${isFavorite ? 'favorite-btn--active' : ''
                }`}
            onClick={handleToggle}
            disabled={loading}
            title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
        >
            <Heart
                className="favorite-btn__icon"
                fill={isFavorite ? 'currentColor' : 'none'}
            />
            {showLabel && (
                <span className="favorite-btn__label">
                    {isFavorite ? 'Favorited' : 'Add to Favorites'}
                </span>
            )}
        </button>
    );
};

export default FavoriteButton;
