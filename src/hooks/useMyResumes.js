import { useContext } from 'react';
import MyResumesContext from '../contexts/MyResumesContext';

export const useMyResumes = () => {
  const context = useContext(MyResumesContext);

  if (context === undefined) {
    throw new Error('useMyResumes должен вызываться внутри <MyResumesProvider>');
  }

  return context;
};
