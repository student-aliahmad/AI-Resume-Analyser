import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router";
import { useAuth, SignIn } from "@clerk/clerk-react";

export const meta = () => ([
  { title: 'Resumind | Auth' },
  { name: 'description', content: 'Log into your account' },
]);

const Auth = () => {
  const { isLoaded, isSignedIn } = useAuth();
  const location = useLocation();
  const next = location.search.split('next=')[1] || '/upload';
  const navigate = useNavigate();

  // Agar user already signed in hai to redirect karein
  useEffect(() => {
    if (isLoaded && isSignedIn) {
      navigate(next);
    }
  }, [isLoaded, isSignedIn, next, navigate]);

  return (
    <main className="bg-[url('/images/bg-main.svg')] bg-cover min-h-screen flex items-center justify-center p-4">
      <div className="gradient-border shadow-lg rounded-2xl overflow-hidden">
        <section className="flex flex-col items-center gap-6 bg-white rounded-2xl p-8">
          <div className="flex flex-col items-center gap-2 text-center">
            <h1 className="text-3xl font-bold text-gray-900">Welcome</h1>
            <h2 className="text-gray-600 text-sm">Log In to Continue Your Job Journey</h2>
          </div>

          {!isLoaded ? (
            <div className="animate-pulse p-4 text-gray-500">
              Loading authentication...
            </div>
          ) : (
            <SignIn fallbackRedirectUrl={next} />
          )}
        </section>
      </div>
    </main>
  );
};

export default Auth;