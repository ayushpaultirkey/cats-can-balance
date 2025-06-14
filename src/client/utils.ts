import { WebviewToBlockMessage } from "../devvit/message";

export function sendToDevvit(event: WebviewToBlockMessage) {
  window.parent?.postMessage(event, "*");
}