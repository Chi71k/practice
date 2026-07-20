import { useCallback, useMemo } from 'react';
import ProfileContext from '../contexts/ProfileContext';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { PROFILE_STORAGE_KEY } from '../constants/storageKeys';

const ProfileProvider = ({ children }) => {
  const [profile, setProfile, removeProfile] = useLocalStorage(PROFILE_STORAGE_KEY, null);

  const saveProfile = useCallback((profileData) => {
    setProfile(profileData);
  }, [setProfile]);

  const clearProfile = useCallback(() => {
    removeProfile();
  }, [removeProfile]);

  const isProfileFilled = !!profile;

  const value = useMemo(() => ({
    profile,
    isProfileFilled,
    saveProfile,
    clearProfile,
  }), [profile, isProfileFilled, saveProfile, clearProfile]);

  return (
    <ProfileContext value={value}>
      {children}
    </ProfileContext>
  );
};

export default ProfileProvider;
