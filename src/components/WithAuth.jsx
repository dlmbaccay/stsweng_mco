import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, firestore } from '../lib/firebase';
import Loader from './Loader';

const WithAuth = (WrappedComponent) => {
  const WrapperComponent = (props) => {
    const [user, loading, error] = useAuthState(auth);
    const [authChecked, setAuthChecked] = useState(false);
    const router = useRouter();

    useEffect(() => {
      if (!loading && !user) {
        router.push('/landing'); // Redirect to the login page if the user is not authenticated
      } else if (user) {
        firestore.collection('users').doc(user.uid).get()
        .then((doc) => {
          if (!doc.exists) {
            if (router.pathname !== '/setup') {
              router.push('/setup');
            }
          }
        })
        .catch((error) => {
          console.log('Error getting document:', error);
        });
      }
      setAuthChecked(true); // Set the authChecked state to true once the authentication state is determined
    }, [user, loading, router]);

    if (!authChecked || loading) {
      // Show a loading indicator while checking the authentication state
      return <Loader show={true}/>;
    }

    return <WrappedComponent {...props} />;
  };

  WrapperComponent.displayName = `withAuth(${WrappedComponent.displayName || WrappedComponent.name || 'Component'})`;

  return WrapperComponent;
};

export default WithAuth;
