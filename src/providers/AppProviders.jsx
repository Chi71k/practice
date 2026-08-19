import AuthProvider from './AuthProvider';
import ProfileProvider from './ProfileProvider';
import MyResumesProvider from './MyResumesProvider';

const AppProviders = ({ children }) => (
  <AuthProvider>
    <ProfileProvider>
      <MyResumesProvider>
        {children}
      </MyResumesProvider>
    </ProfileProvider>
  </AuthProvider>
);

export default AppProviders;
