declare module "htmltojsx" {
  function convert(html: string, options?: Record<string, unknown>): string;
  export default convert;
}
