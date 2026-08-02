declare module "*.png" {
  const src: string | { src: string; height: number; width: number };
  export default src;
}

declare module "*.jpg" {
  const src: string | { src: string; height: number; width: number };
  export default src;
}

declare module "*.svg" {
  const src: string;
  export default src;
}
