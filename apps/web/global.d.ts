declare module "spark-md5" {
  export default class SparkMD5 {
    static hash(str: string): string;
  }
}

declare module "htmltojsx" {
  function convert(html: string, options?: Record<string, unknown>): string;
  export default convert;
}
