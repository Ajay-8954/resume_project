import { useState, useEffect } from "react";

export const useGoogleSignIn = () => {
  const [user, setUser] = useState(null);
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const CLIENT_ID = "617265112177-2f6l38vl5c7t8cmeief28p1ik6ecboj9.apps.googleusercontent.com";

  useEffect(() => {
    const initializeGoogle = () => {
      if (window.google && window.google.accounts) {
        window.google.accounts.id.initialize({
          client_id: CLIENT_ID,
          callback: handleCredentialResponse,
        });

        window.google.accounts.id.renderButton(
          document.getElementById("google-signin-button"),
          { theme: "outline", size: "large" }
        );
        setIsLoading(false);
      } else {
        console.error("Google API not loaded");
      }
    };

    const handleCredentialResponse = async (response) => {
      try {
        const id_token = response.credential;
        const res = await fetch("http://localhost:5000/api/auth/google", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id_token }),
        });
        const data = await res.json();

        if (data.message === "Login successful") {
          setUser(data.user); // assuming backend sends user object
          setIsSignedIn(true);
        } else {
          throw new Error(data.error || "Login failed");
        }
      } catch (err) {
        console.error("Google Sign-In Error:", err);
      }
    };

    // Wait for script to be ready
    if (window.google && window.google.accounts) {
      initializeGoogle();
    } else {
      const interval = setInterval(() => {
        if (window.google && window.google.accounts) {
          clearInterval(interval);
          initializeGoogle();
        }
      }, 300);
    }
  }, []);

  const signOut = () => {
    window.google.accounts.id.disableAutoSelect();
    setUser(null);
    setIsSignedIn(false);
  };

  return { user, isSignedIn, isLoading, signOut };
};
