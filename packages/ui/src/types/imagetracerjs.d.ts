/** imagetracerjs ships no types; declare only what the tracer tool uses. */
declare module "imagetracerjs" {
  interface TracerOptions {
    preset?: string;
    numberofcolors?: number;
    blurradius?: number;
    ltres?: number;
    qtres?: number;
    pathomit?: number;
    scale?: number;
    [key: string]: unknown;
  }

  interface ImageTracer {
    imagedataToSVG(imageData: ImageData, options?: TracerOptions | string): string;
    imageToSVG(url: string, callback: (svg: string) => void, options?: TracerOptions | string): void;
  }

  const ImageTracer: ImageTracer;
  export default ImageTracer;
}
