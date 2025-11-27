import React from 'react';
import { User, ThumbsUp, Flag } from 'lucide-react';
import StarRating from './StarRating';
import './RatingList.css';

interface Rating {
    id: number;
    user_id: number;
    user_name: string;
    rating: number;
    review: string | null;
    created_at: string;
    updated_at: string;
}

interface RatingListProps {
    ratings: Rating[];
    loading?: boolean;
}

const RatingList: React.FC<RatingListProps> = ({ ratings, loading = false }) => {
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = Math.abs(now.getTime() - date.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 0) {
            return 'Today';
        } else if (diffDays === 1) {
            return 'Yesterday';
        } else if (diffDays < 7) {
            return `${diffDays} days ago`;
        } else if (diffDays < 30) {
            return `${Math.floor(diffDays / 7)} weeks ago`;
        } else if (diffDays < 365) {
            return `${Math.floor(diffDays / 30)} months ago`;
        } else {
            return date.toLocaleDateString();
        }
    };

    if (loading) {
        return (
            <div className="rating-list-loading">
                <div className="rating-list-spinner"></div>
                <p>Loading reviews...</p>
            </div>
        );
    }

    if (ratings.length === 0) {
        return (
            <div className="rating-list-empty">
                <p>No reviews yet. Be the first to review!</p>
            </div>
        );
    }

    return (
        <div className="rating-list">
            {ratings.map((rating) => (
                <div key={rating.id} className="rating-item">
                    <div className="rating-item-header">
                        <div className="rating-item-user">
                            <div className="rating-item-avatar">
                                <User size={20} />
                            </div>
                            <div className="rating-item-info">
                                <h4 className="rating-item-name">{rating.user_name}</h4>
                                <span className="rating-item-date">
                                    {formatDate(rating.created_at)}
                                </span>
                            </div>
                        </div>
                        <StarRating rating={rating.rating} readonly size="sm" />
                    </div>

                    {rating.review && (
                        <div className="rating-item-review">
                            <p>{rating.review}</p>
                        </div>
                    )}

                    <div className="rating-item-actions">
                        <button className="rating-item-action" title="Helpful">
                            <ThumbsUp size={16} />
                            <span>Helpful</span>
                        </button>
                        <button className="rating-item-action" title="Report">
                            <Flag size={16} />
                            <span>Report</span>
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default RatingList;
