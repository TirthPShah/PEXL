declare module "pdf-parse" {
  interface PDFData {
    numpages: number;
    text: string;
    info: any;
    metadata: any;
    version: string;
  }

  function pdfParse(dataBuffer: Buffer): Promise<PDFData>;
  export = pdfParse;
}

declare module "pdf-parse/lib/pdf-parse.js" {
  interface PDFData {
    numpages: number;
    text: string;
    info: any;
    metadata: any;
    version: string;
  }

  function pdfParse(dataBuffer: Buffer): Promise<PDFData>;
  export = pdfParse;
}
