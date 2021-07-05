/*########################################################
 * Extracts the text from a PDF and stores it in memory.
 * Also extracts the file name.
 *
 * param {string} : fileID : file ID of the PDF that the text will be extracted from.
 *
 * returns {array} : Contains the file name (section) and PDF text.
 *
 */
function getTextFromPDF(fileID) {
  const blob = DriveApp.getFileById(fileID).getBlob();
  const resource = {
    title: blob.getName(),
    mimeType: blob.getContentType()
  };
  const options = {
    ocr: true, 
    ocrLanguage: "es"
  };
  // Convert the pdf to a Google Doc with ocr.
  const file = Drive.Files.insert(resource, blob, options);
 
  // Get the texts from the newly created text.
  const doc = DocumentApp.openById(file.id);
  const text = doc.getBody().getText();
  const title = doc.getName();

  // Deleted the document once the text has been stored.
  Drive.Files.remove(doc.getId());
  
  return {
    name: title,
    text: text
  };
};
