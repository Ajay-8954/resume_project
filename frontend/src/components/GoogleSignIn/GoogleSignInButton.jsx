import { useEffect } from "react";

export default function GoogleSignInButton({ onSuccess, onError }) {
  useEffect(() => {
    if (!window.google) {
      console.error("Google API not loaded.");
      return;
    }

    window.google.accounts.id.initialize({
      client_id:
        "617265112177-2f6l38vl5c7t8cmeief28p1ik6ecboj9.apps.googleusercontent.com",
      callback: handleCredentialResponse,
    });

    window.google.accounts.id.renderButton(
      document.getElementById("gsi-button"),
      { theme: "outline", size: "large" }
    );
  }, []);

  const handleCredentialResponse = async (response) => {
    try {
      const token = response.credential;

      // ✅ Send the token to your backend
      const res = await fetch("http://localhost:5000/api/auth/google", {
        method: "POST",
        credentials: "include", // Send/receive cookies
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id_token: token }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || "Google login failed");
      }

      onSuccess?.(data.user); // User info from backend
    } catch (err) {
      console.error(err);
      onError?.(err.message);
    }
  };

  // Helper to decode the JWT (optional)
  const parseJwt = (token) => {
    try {
      const base64Url = token.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split("")
          .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
          .join("")
      );
      return JSON.parse(jsonPayload);
    } catch (e) {
      return null;
    }
  };

  return <div id="gsi-button" className="flex justify-center mt-2" />;
}
