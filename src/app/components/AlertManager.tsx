"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

interface AlertMessages {
  [key: string]: string;
}

interface AlertManagerProps {
  path: string;
}

const AlertManager: React.FC<AlertManagerProps> = ({ path }) => {
  const router = useRouter();
  const [displayMessage, setDisplayMessage] = useState<string | null>(null);
  const [showAlert, setShowAlert] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const hideTimerRef = useRef<number | null>(null);
  const removeTimerRef = useRef<number | null>(null);

  useEffect(() => {
    const storedMessage = sessionStorage.getItem("alertMessage");

    if (storedMessage) {
      setDisplayMessage(decodeURIComponent(storedMessage));
      setShowAlert(true);
      setTimeout(() => setIsVisible(true), 10);

      sessionStorage.removeItem("alertMessage");
      return;
    }

    const cookieMatch = document.cookie.match(/(?:^|; )alert_message=([^;]*)/);
    if (cookieMatch?.[1]) {
      setDisplayMessage(decodeURIComponent(cookieMatch[1]));
      setShowAlert(true);
      setTimeout(() => setIsVisible(true), 10);
      document.cookie =
        "alert_message=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    }
  }, []);

  useEffect(() => {
    if (!showAlert || !displayMessage) {
      return undefined;
    }

    hideTimerRef.current = window.setTimeout(() => {
      setIsVisible(false);
      removeTimerRef.current = window.setTimeout(() => {
        setShowAlert(false);
      }, 250);
    }, 2000);

    return () => {
      if (hideTimerRef.current) {
        window.clearTimeout(hideTimerRef.current);
      }
      if (removeTimerRef.current) {
        window.clearTimeout(removeTimerRef.current);
      }
    };
  }, [showAlert, displayMessage]);

  return (
    <>
      {showAlert && displayMessage && (
        <div className="fixed top-6 left-1/2 transform -translate-x-1/2 z-50">
          <div
            className={`p-4 rounded-2xl shadow-xl border border-emerald-100 bg-white/90 text-slate-800 backdrop-blur transition-all duration-300 ease-out ${
              isVisible
                ? "opacity-100 translate-y-0 scale-100"
                : "opacity-0 -translate-y-2 scale-95"
            }`}
            role="alert"
          >
            <div className="flex justify-between items-center">
              <span>{displayMessage}</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AlertManager;
