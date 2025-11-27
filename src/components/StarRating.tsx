import React, { useState } from 'react';
import { Star } from 'lucide-react';
import './StarRating.css';

interface StarRatingProps {
    rating: number;
    onRatingChange?: (rating: number) => void;
    readonly?: boolean;
    size?: 'sm' | 'md' | 'lg';
    showCount?: boolean;
    count?: number;
}

const StarRating: React.FC<StarRatingProps> = ({
    rating,
    onRatingChange,
    readonly = false,
    size = 'md',
    showCount = false,
    count = 0
}) => {
    const [hoverRating, setHoverRating] = useState<number>(0);

    const handleClick = (value: number) => {
        if (!readonly && onRatingChange) {
            onRatingChange(value);
        }
    };

    const handleMouseEnter = (value: number) => {
        if (!readonly) {
            setHoverRating(value);
        }
    };

    const handleMouseLeave = () => {
        if (!readonly) {
            setHoverRating(0);
        }
    };

    const displayRating = hoverRating || rating;

    const sizeClasses = {
        sm: 'star-rating--sm',
        md: 'star-rating--md',
        lg: 'star-rating--lg'
    };

    return (
        <div className="star-rating">
            <div className={`star-rating__stars ${sizeClasses[size]}`}>
                {[1, 2, 3, 4, 5].map((value) => (
                    <button
                        key={value}
                        type="button"
                        className={`star-rating__star ${value <= displayRating ? 'star-rating__star--filled' : ''
                            } ${readonly ? 'star-rating__star--readonly' : ''}`}
                        onClick={() => handleClick(value)}
                        onMouseEnter={() => handleMouseEnter(value)}
                        onMouseLeave={handleMouseLeave}
                        disabled={readonly}
                        aria-label={`${value} stars`}
                    >
                        <Star
                            className="star-rating__icon"
                            fill={value <= displayRating ? 'currentColor' : 'none'}
                        />
                    </button>
                ))}
            </div>
            {showCount && count > 0 && (
                <span className="star-rating__count">
                    ({count} {count === 1 ? 'review' : 'reviews'})
                </span>
            )}
        </div>
    );
};

export default StarRating;
