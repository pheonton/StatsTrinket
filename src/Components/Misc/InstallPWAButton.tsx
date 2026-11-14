import { useEffect, useState } from 'react';
import { BeforeInstallPromptEvent } from '../../global';

export const InstallPWAButton = () => {
  const [promptInstall, setPromptInstall] =
    useState<BeforeInstallPromptEvent | null>(null);


  const handler = (e: BeforeInstallPromptEvent) => {
    e.preventDefault();
    setPromptInstall(e);
  };

  useEffect(() => {
    window.addEventListener('beforeinstallprompt', handler);

    return () => window.removeEventListener('transitionend', handler);
  }, []);

  if (!promptInstall) {
    return null;
  }

  return (
    <button
      className="mt-1 mb-1 bg-primary-main px-3 py-1 rounded-md duration-200 ease-in-out shadow-[1px_2px_4px_0px_rgba(0,0,0,0.3)] hover:bg-primary-dark font-bold"
      aria-label="Install app"
      title="Install app"
      onClick={(e) => {
        e.preventDefault();
        if (!promptInstall) {
          return;
        }
        promptInstall.prompt();
      }}
    >
      Install as a PWA
    </button>
  );
};
