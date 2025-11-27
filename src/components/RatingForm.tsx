import React, { useState } from 'react';
import { X } from 'lucide-react';
import StarRating from './StarRating';
import ApiService from '../services/ApiService';
import { toast } from 'react-toastify';
import './RatingForm.css';

interface RatingFormProps {
    businessId: number;
    businessName: string;
    existingRating?: {
        rating: number;
        review: string;
    };
    onClose: () => void;
    onSuccess: () => void;
}

const RatingForm: React.FC<RatingFormProps> = ({
    businessId,
    businessName,
    existingRating,
    onClose,
    onSuccess
}) => {
    const [rating, setRating] = useState<number>(existingRating?.rating || 0);
    const [review, setReview] = useState<string>(existingRating?.review || '');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (rating === 0) {
            toast.error('Please select a rating');
            return;
        }

        setLoading(true);

        try {
            await ApiService.post(`/businesses/${businessId}/ratings`, {
                rating,
                review: review.trim() || null
            });

            toast.success(
                existingRating
                    ? 'Rating updated successfully'
                    : 'Rating submitted successfully'
            );
            onSuccess();
            onClose();
        } catch (error: any) {
            console.error('Error submitting rating:', error);
            const errorMessage =
                error.response?.data?.message ||
                'Failed to submit rating. Please try again.';
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="rating-form-overlay" onClick={onClose}>
            <div
                className="rating-form-container"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="rating-form-header">
                    <h2 className="rating-form-title">
                        {existingRating ? 'Update Your Review' : 'Write a Review'}
                    </h2>
                    <button
                        type="button"
                        className="rating-form-close"
                        onClick={onClose}
                        aria-label="Close"
                    >
                        <X size={24} />
                    </button>
                </div>

                <div className="rating-form-business">
                    <p className="rating-form-business-name">{businessName}</p>
                </div>

                <form onSubmit={handleSubmit} className="rating-form">
                    <div className="rating-form-field">
                        <label className="rating-form-label">Your Rating *</label>
                        <div className="rating-form-stars">
                            <StarRating
                                rating={rating}
                                onRatingChange={setRating}
                                size="lg"
                            />
                            {rating > 0 && (
                                <span className="rating-form-rating-text">
                                    {rating === 1 && 'Poor'}
                                    {rating === 2 && 'Fair'}
                                    {rating === 3 && 'Good'}
                                    {rating === 4 && 'Very Good'}
                                    {rating === 5 && 'Excellent'}
                                </span>
                            )}
                        </div>
                    </div>

                    <div className="rating-form-field">
                        <label htmlFor="review" className="rating-form-label">
                            Your Review (Optional)
                        </label>
                        <textarea
                            id="review"
                            className="rating-form-textarea"
                            value={review}
                            onChange={(e) => setReview(e.target.value)}
                            rows={4}
                            maxLength={500}
                            placeholder="Share your experience with this business..."
                        />
                        <div className="rating-form-char-count">
                            {review.length}/500 characters
                        </div>
                    </div>

                    <div className="rating-form-actions">
                        <button
                            type="button"
                            className="rating-form-btn rating-form-btn--cancel"
                            onClick={onClose}
                            disabled={loading}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="rating-form-btn rating-form-btn--submit"
                            disabled={loading || rating === 0}
                        >
                            {loading
                                ? 'Submitting...'
                                : existingRating
                                    ? 'Update Review'
                                    : 'Submit Review'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default RatingForm;
