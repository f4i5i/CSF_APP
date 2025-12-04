import { useEffect, useRef } from 'react';

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (options: {
            client_id: string;
            callback: (response: { credential?: string | null }) => void;
          }) => void;
          renderButton: (element: HTMLElement, options: Record<string, unknown>) => void;
        };
      };
    };
  }
}

type GoogleSignInButtonProps = {
  onSuccess: (credential: string) => void;
  onError?: (message?: string) => void;
  text?: string;
  className?: string;
};

const SCRIPT_SRC = 'https://accounts.google.com/gsi/client';
const BUTTON_OPTIONS = {
  type: 'standard',
  theme: 'outline',
  size: 'large',
  width: 280,
  text: 'signin_with',
  shape: 'pill',
};

const baseFallbackClasses =
  'flex w-full items-center justify-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-700 shadow-sm';

function combineClasses(...classes: Array<string | undefined>) {
  return classes.filter(Boolean).join(' ');
}

export default function GoogleSignInButton({
  onSuccess,
  onError,
  text = 'Sign in with Google',
  className,
}: GoogleSignInButtonProps) {
  const buttonRef = useRef<HTMLDivElement | null>(null);
  const clientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;

  useEffect(() => {
    if (!clientId) {
      onError?.('Missing REACT_APP_GOOGLE_CLIENT_ID');
      return;
    }

    const initialize = () => {
      if (!window.google || !buttonRef.current) {
        return;
      }

      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: (response) => {
          if (response.credential) {
            onSuccess(response.credential);
          } else {
            onError?.('No credential returned from Google');
          }
        },
      });

      window.google.accounts.id.renderButton(buttonRef.current, BUTTON_OPTIONS);
    };

    if (window.google) {
      initialize();
      return;
    }

    const script = document.createElement('script');
    script.src = SCRIPT_SRC;
    script.async = true;
    script.defer = true;
    script.onload = initialize;
    script.onerror = () => onError?.('Unable to load Google script');
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, [clientId, onError, onSuccess]);

  if (!clientId) {
    return (
      <button
        type="button"
        className={combineClasses(baseFallbackClasses, className)}
        disabled
      >
        {text}
      </button>
    );
  }

  return <div ref={buttonRef} className={combineClasses('w-full', className)} />;
}
