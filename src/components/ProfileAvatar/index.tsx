import React from 'react';
import { PLACEHOLDER_PROFILE_IMAGE } from '../../types';
import { getInitials } from '../../utils/getInitials';
import './ProfileAvatar.scss';

interface ProfileAvatarProps {
  photoURL: string | null;
  displayName: string | null;
  email: string | null;
  size: number;
  className?: string;
}

const ProfileAvatar: React.FC<ProfileAvatarProps> = ({
  photoURL,
  displayName,
  email,
  size,
  className,
}) => {
  const hasRealPhoto =
    photoURL && photoURL !== PLACEHOLDER_PROFILE_IMAGE;

  if (hasRealPhoto) {
    return (
      <img
        src={photoURL}
        alt="Profile"
        referrerPolicy="no-referrer"
        className={`profile-avatar profile-avatar--image ${className || ''}`}
        style={{ width: size, height: size }}
      />
    );
  }

  const initials = getInitials(displayName, email);
  const fontSize = Math.max(Math.round(size * 0.4), 10);

  return (
    <div
      className={`profile-avatar profile-avatar--initials ${className || ''}`}
      style={{
        width: size,
        height: size,
        fontSize,
        lineHeight: `${size}px`,
      }}
      aria-label={displayName || email || 'User avatar'}
    >
      {initials}
    </div>
  );
};

export default ProfileAvatar;
