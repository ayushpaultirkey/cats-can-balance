/** Message from Devvit to the web view. */
export type DevvitMessage =
  | { type: 'initialData'; data: { currentScore: number } }

/** Message from the web view to Devvit. */
export type WebViewMessage =
  | { type: 'webViewReady' }
  | { type: 'setScore'; data: { newScore: number } };
