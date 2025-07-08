// Global type definitions for Richard Mille Dashboard

// Web Audio API types
interface Window {
  webkitAudioContext: typeof AudioContext;
}

// WebGL types
declare module "*.glsl" {
  const content: string;
  export default content;
}

declare module "*.vs" {
  const content: string;
  export default content;
}

declare module "*.fs" {
  const content: string;
  export default content;
}

declare module "*.vert" {
  const content: string;
  export default content;
}

declare module "*.frag" {
  const content: string;
  export default content;
}

// Audio file types
declare module "*.mp3" {
  const src: string;
  export default src;
}

declare module "*.wav" {
  const src: string;
  export default src;
}

declare module "*.ogg" {
  const src: string;
  export default src;
}

declare module "*.m4a" {
  const src: string;
  export default src;
}