import { useRef } from 'react';
import { twc } from 'react-twc';
import { useGlobalSettings } from '../../Hooks/useGlobalSettings';
import { usePlayers } from '../../Hooks/usePlayers';
import { InstallPWAButton } from '../Misc/InstallPWAButton';
import { Separator } from '../Misc/Separator';
import { Paragraph } from '../Misc/TextComponents';
import { ToggleButton } from '../Misc/ToggleButton';
import { Dialog } from './Dialog';
import { ShareDialog } from './ShareDialog';

const SettingContainer = twc.div`w-full flex flex-col mb-2`;

const ToggleContainer = twc.div`flex flex-row justify-between items-center -mb-1`;

const Description = twc.p`mr-16 text-xs text-left text-text-secondary mt-1`;

const baseGithubReleasesUrl =
  'https://github.com/pheonton/StatsTrinket/releases/tag/';

export const SettingsDialog = ({
  dialogRef,
}: {
  dialogRef: React.MutableRefObject<HTMLDialogElement | null>;
}) => {
  const {
    settings,
    setSettings,
    isPWA,
    version,
    initialGameSettings,
    gameScore,
    lifeHistory,
    savedGame,
  } = useGlobalSettings();
  const { players, startingPlayerIndex } = usePlayers();

  const shareDialogRef = useRef<HTMLDialogElement | null>(null);

  const handleShareGame = () => {
    try {
      shareDialogRef.current?.showModal();
    } catch (error) {
      console.error('Failed to open share dialog:', error);
    }
  };

  const hasGameToShare = (players && players.length > 0) || savedGame !== null;

  return (
    <>
      <Dialog id="settings" title="Settings" dialogRef={dialogRef}>
        <div className="flex flex-col mb-2 w-full">
          <div className="text-text-primary flex items-center gap-2">
            Current version: {version.installedVersion}{' '}
            {version.isLatest && (
              <span className="text-sm text-text-secondary">(latest)</span>
            )}
            <div className="text-xs text-text-primary opacity-75">
              (
              <a
                href={baseGithubReleasesUrl + version.installedVersion}
                target="_blank"
                className="underline"
              >
                Release notes
              </a>
              )
            </div>
          </div>
          {!version.isLatest && version.remoteVersion && (
            <>
              <div className="flex gap-2 items-center mt-2">
                <Paragraph className="text-text-secondary">
                  {version.remoteVersion} available!
                </Paragraph>
                <div className="text-xs text-text-primary opacity-75">
                  (
                  <a
                    href={baseGithubReleasesUrl + version.remoteVersion}
                    target="_blank"
                    className="underline"
                  >
                    Release notes
                  </a>
                  )
                </div>
              </div>
              <button
                className="flex justify-center items-center self-start mt-2 bg-primary-main px-3 py-1 rounded-md"
                onClick={() => window.location.reload()}
              >
                <span className="text-sm">Update</span>
                <span className="text-xs">&nbsp;(reload app)</span>
              </button>
            </>
          )}
        </div>
        <Separator height="1px" />

        {/* Share Game Section */}
        <SettingContainer>
          <div className="flex flex-col gap-2">
            <div className="flex flex-row justify-between items-center">
              <label>Share Game</label>
              <button
                onClick={handleShareGame}
                disabled={!hasGameToShare}
                className="px-4 py-2 bg-primary-main text-white rounded-md hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                  />
                </svg>
                Share via QR
              </button>
            </div>
            <Description>
              Generate a QR code to share your{' '}
              {players && players.length > 0 ? 'current' : 'saved'} game state
              with other players. They can scan it to load the exact same game.
              {!hasGameToShare && (
                <span className="block mt-1 text-red-500">
                  Start or save a game first to enable sharing.
                </span>
              )}
            </Description>
          </div>
        </SettingContainer>
        <Separator height="1px" />

        <SettingContainer>
          <ToggleContainer>
            <label>Show Player Menu Cog</label>
            <ToggleButton
              checked={settings.showPlayerMenuCog}
              onChange={() => {
                setSettings({
                  ...settings,
                  showPlayerMenuCog: !settings.showPlayerMenuCog,
                });
              }}
            />
          </ToggleContainer>
          <Description>
            A cog on the top right of each player's card will be shown if this
            is enabled.
          </Description>
        </SettingContainer>
        <SettingContainer>
          <ToggleContainer>
            <label>Show Start Player</label>
            <ToggleButton
              checked={settings.showStartingPlayer}
              onChange={() => {
                setSettings({
                  ...settings,
                  showStartingPlayer: !settings.showStartingPlayer,
                });
              }}
            />
          </ToggleContainer>
          <Description>
            On start or reset of a game, a random starting player is picked
            and shown on their card.
          </Description>
        </SettingContainer>
        <SettingContainer>
          <ToggleContainer>
            <label>Keep Awake</label>
            <ToggleButton
              checked={settings.keepAwake}
              onChange={() => {
                setSettings({
                  ...settings,
                  keepAwake: !settings.keepAwake,
                });
              }}
            />
          </ToggleContainer>
          <Description>
            Will prevent device from going to sleep while this app is open if
            this is enabled.
          </Description>
        </SettingContainer>
        {(!window.isIOS || window.isIPad) && (
          <SettingContainer>
            <ToggleContainer>
              <label>Fullscreen on start</label>
              <ToggleButton
                checked={settings.goFullscreenOnStart}
                onChange={() => {
                  setSettings({
                    ...settings,
                    goFullscreenOnStart: !settings.goFullscreenOnStart,
                  });
                }}
              />
            </ToggleContainer>
            <Description>
              Will enter fullscreen mode when starting a game if this is
              enabled.
            </Description>
          </SettingContainer>
        )}

        <SettingContainer>
          <ToggleContainer>
            <label>Show Match Score</label>
            <ToggleButton
              checked={settings.showMatchScore}
              onChange={() => {
                setSettings({
                  ...settings,
                  showMatchScore: !settings.showMatchScore,
                });
              }}
            />
          </ToggleContainer>
          <Description>
            Shows a score badge on each player's card to track wins across
            multiple games.
          </Description>
        </SettingContainer>
        <SettingContainer>
          <ToggleContainer>
            <label>Round Timer</label>
            <ToggleButton
              checked={settings.showTimer}
              onChange={() => {
                setSettings({
                  ...settings,
                  showTimer: !settings.showTimer,
                });
              }}
            />
          </ToggleContainer>
          <Description>
            Shows a countdown progress bar at the top of the play area. Tap to
            pause/resume. Alerts when time runs out.
          </Description>
          {settings.showTimer && (
            <div className="mt-2 flex flex-col gap-2 ml-2 pl-2 border-l-2 border-white/20">
              <div className="flex flex-row justify-between items-center">
                <label htmlFor="countdown-minutes" className="text-sm">
                  Minutes
                </label>
                <input
                  type="number"
                  id="countdown-minutes"
                  name="countdown-minutes"
                  min={1}
                  max={999}
                  value={settings.countdownMinutes}
                  className="bg-secondary-main border-none outline-none text-text-primary rounded-md p-1 text-xs font-semibold w-16 text-center"
                  onChange={(e) => {
                    const val = Math.max(
                      1,
                      Math.min(999, Number(e.target.value) || 1)
                    );
                    setSettings({
                      ...settings,
                      countdownMinutes: val,
                    });
                  }}
                />
              </div>
            </div>
          )}
        </SettingContainer>
        <Separator height="1px" />
        <div className="flex w-full justify-center">
          <button
            className="mt-1 mb-1 bg-primary-main px-3 py-1 rounded-md duration-200 ease-in-out shadow-[1px_2px_4px_0px_rgba(0,0,0,0.3)] hover:bg-primary-dark font-bold"
            onClick={() => {
              dialogRef.current?.close();
            }}
          >
            <span className="text-sm">Save and Close</span>
          </button>
        </div>
        {!isPWA && (
          <>
            {window.isIOS && (
              <>
                <Separator height="1px" />
                <SettingContainer>
                  <ToggleContainer>
                    <Paragraph>
                      <b>Tip:</b> You can{' '}
                      <b>add this webapp to your home page</b> to have it act
                      just like a normal app!
                    </Paragraph>
                  </ToggleContainer>
                  <Description className="mt-1">
                    If you do, this web app will work offline and the toolbar
                    will be automatically hidden.
                  </Description>
                </SettingContainer>
              </>
            )}

            {!window.isIOS && (
              <>
                <Separator height="1px" />
                <SettingContainer>
                  <ToggleContainer>
                    <Paragraph>
                      <b>Tip:</b> You can <b>install this page as a PWA</b> to
                      have it act just like a normal app!
                    </Paragraph>
                  </ToggleContainer>
                  <Description className="mt-1">
                    If you do, this web app will work offline and the toolbar
                    will be automatically hidden. PWA stands for Progressive Web
                    Application
                  </Description>
                </SettingContainer>
                <div className="flex w-full justify-center">
                  <InstallPWAButton />
                </div>
              </>
            )}
          </>
        )}
        <Separator height="1px" />
      </Dialog>

      <ShareDialog
        dialogRef={shareDialogRef}
        players={players && players.length > 0 ? players : savedGame?.players || []}
        initialGameSettings={
          players && players.length > 0
            ? initialGameSettings
            : savedGame?.initialGameSettings || initialGameSettings
        }
        startingPlayerIndex={
          players && players.length > 0
            ? startingPlayerIndex
            : savedGame?.players.findIndex((p) => p.isStartingPlayer) ?? 0
        }
        gameScore={
          players && players.length > 0
            ? gameScore
            : savedGame?.gameScore
        }
        lifeHistory={lifeHistory}
        version={version.installedVersion}
      />
    </>
  );
};
