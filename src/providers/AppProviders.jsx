import ProfileProvider from './ProfileProvider';
import MyResumesProvider from './MyResumesProvider';

const AppProviders = ({ children }) => (
  <ProfileProvider>
    <MyResumesProvider>
      {children}
    </MyResumesProvider>
  </ProfileProvider>
);

export default AppProviders;
