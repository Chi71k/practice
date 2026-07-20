import { useContext } from 'react';
import ProfileContext from '../contexts/ProfileContext';

export const useProfile = () => {
  const context = useContext(ProfileContext);

  if (context === undefined) {
    throw new Error('useProfile должен вызываться внутри <ProfileProvider>');
  }

  return context;
};
