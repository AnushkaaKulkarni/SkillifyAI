import axios from "axios";
import mammoth from "mammoth";
import pdfParse from "pdf-parse/lib/pdf-parse.js";


/* ======================================================
   USED BY MATERIALS / SUMMARY (URL BASED)
====================================================== */
const extractTextFromUrl = async (fileUrl, fileName) => {
  const response = await axios.get(fileUrl, {
    responseType: "arraybuffer",
  });

  const lowerName = fileName.toLowerCase();

  // PDF
  if (lowerName.endsWith(".pdf")) {
    const pdfParseModule = await import("pdf-parse");
    const pdfParse = pdfParseModule.default || pdfParseModule;
    const data = await pdfParse(response.data);
    return data.text;
  }

  // DOCX
  if (lowerName.endsWith(".docx")) {
    const result = await mammoth.extractRawText({
      buffer: response.data,
    });
    return result.value;
  }

  // PPTX
  if (lowerName.endsWith(".pptx")) {
    return "PPTX summarization not yet implemented.";
  }

  throw new Error("Unsupported file type");
};

/* ======================================================
   USED ONLY FOR CREATE EXAM (LOCAL UPLOAD)
====================================================== */
export const extractTextFromUploadedFile = async (file) => {
  if (!file) {
    throw new Error("No uploaded file received");
  }

  const { mimetype, buffer } = file;

  if (mimetype === "application/pdf") {
    const data = await pdfParse(buffer);
    return data.text;
  }

  if (
    mimetype ===
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ) {
    const result = await mammoth.extractRawText({ buffer });
    return result.value;
  }

  if (mimetype === "text/plain") {
    return buffer.toString("utf-8");
  }

  throw new Error(`Unsupported file type: ${mimetype}`);
};

export default extractTextFromUrl;