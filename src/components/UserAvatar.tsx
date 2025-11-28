import React from 'react';

interface UserAvatarProps {
    name: string;
    avatar?: string | null;
    size?: 'sm' | 'md' | 'lg';
    className?: string;
}

const UserAvatar: React.FC<UserAvatarProps> = ({
    name,
    avatar,
    size = 'md',
    className = ''
}) => {
    // Get initials from name (first letter of first and last name)
    const getInitials = (fullName: string): string => {
        const names = fullName.trim().split(' ');
        if (names.length === 1) {
            return names[0].charAt(0).toUpperCase();
        }
        const firstInitial = names[0].charAt(0).toUpperCase();
        const lastInitial = names[names.length - 1].charAt(0).toUpperCase();
        return `${firstInitial}${lastInitial}`;
    };

    const sizeClasses = {
        sm: 'h-8 w-8 text-sm',
        md: 'h-10 w-10 text-base',
        lg: 'h-12 w-12 text-lg'
    };

    const initials = getInitials(name);

    return (
        <div className={`${sizeClasses[size]} rounded-full overflow-hidden ${className}`}>
            {avatar ? (
                <img
                    src={avatar}
                    alt={name}
                    className="w-full h-full object-cover"
                />
            ) : (
                <div className="w-full h-full bg-accent-100 dark:bg-accent-900 flex items-center justify-center">
                    <span className="text-accent-800 dark:text-accent-200 font-medium">
                        {initials}
                    </span>
                </div>
            )}
        </div>
    );
};

export default UserAvatar;
