export const cspRules = [
  // Default to only own resources
  "default-src 'self' 'unsafe-inline' onekey.243096.com dev.243096.com onekey-asset.com",
  // Allow all API calls (Can't be restricted bc of custom backends)
  'connect-src *',
  // Allow images from trezor.io
  "img-src 'self' onekey.243096.com devs.243096.com onekey.so *.onekey.so onekey-asset.com",
];

export const ipcMessageKeys = {
  // Updater
  UPDATE_CHECK: 'update/check',
  UPDATE_SETTINGS: 'update/settings',
  UPDATE_CLEAR_SETTINGS: 'update/clearSettings',
  UPDATE_DOWNLOAD: 'update/download',
  UPDATE_INSTALL: 'update/install',
  UPDATE_CHECKING: 'update/checking',
  UPDATE_AVAILABLE: 'update/available',
  UPDATE_NOT_AVAILABLE: 'update/not-available',
  UPDATE_ERROR: 'update/error',
  UPDATE_DOWNLOADING: 'update/downloading',
  UPDATE_DOWNLOADED: 'update/downloaded',
  TOUCH_UPDATE_RES_SUCCESS: 'touch/update-res-success',
  TOUCH_UPDATE_PROGRESS: 'touch/update-progress',

  // App
  APP_VERSION: 'app/version',
  APP_STATE: 'appState',
  APP_READY: 'app/ready',
  APP_RELOAD: 'app/reload',
  APP_FOCUS: 'app/focus',
  APP_QUIT: 'app/quit',
  APP_RESTORE_MAIN_WINDOW: 'app/restoreMainWindow',
  APP_OPEN_PREFERENCES: 'app/openPreferences',
  APP_TOGGLE_MAXIMIZE_WINDOW: 'app/toggleMaximizeWindow',
  APP_RELOAD_BRIDGE_PROCESS: 'app/reloadBridgeProcess',
  APP_SHORCUT: 'app/shortcut',
  APP_IDLE: 'app/idle',
  APP_SET_IDLE_TIME: 'app/setIdleTime',
  APP_OPEN_DEV_TOOLS: 'app/openDevTools',
  APP_GET_ENV_PATH: 'app/getEnvPath',

  // Touch
  TOUCH_ID_CAN_PROMPT: 'touchId/canPrompt',
  TOUCH_ID_PROMPT_RES: 'touchId/prompt-res',
  TOUCH_ID_PROMPT: 'touchId/prompt',
  TOUCH_RES: 'touch/res',
  TOUCH_OPEN_PRIVACY_PANEL: 'touch/openPrivacyPanel',

  // Secure storage
  SECURE_SET_ITEM_ASYNC: 'secure/setItemAsync',
  SECURE_GET_ITEM_ASYNC: 'secure/getItemAsync',
  SECURE_DEL_ITEM_ASYNC: 'secure/delItemAsync',

  // Server
  SERVER_START: 'server/start',
  SERVER_STOP: 'server/stop',
  SERVER_START_RES: 'server/start/res',
  SERVER_LISTENER: 'server/listener',
  SERVER_RESPOND: 'server/respond',

  // Event
  EVENT_OPEN_URL: 'event-open-url',

  // DeepLink
  OPEN_DEEP_LINK_URL: 'deepLink/openUrl',

  SET_ONEKEY_DESKTOP_GLOBALS: 'onekey/setDesktopGlobals',

  // webview
  WEBVIEW_NEW_WINDOW: 'webview/newWindow',
  SET_ALLOWED_PHISHING_URLS: 'webview/setAllowedPhishingUrls',
  CLEAR_WEBVIEW_CACHE: 'webview/clearCache',
};
