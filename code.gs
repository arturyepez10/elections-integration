const sheetkEY= 'ID OF THE PUBLIC SHEET';
const studentMajor = "MAJOR OF THE STUDENT";
const period = 'CLASS PERIOD OF ELECTIONS';

const onFormSubmit = ({ response } = {}) => {
  try {
    // List of responses of the form
    const responses = response.getItemResponses();

    // We get the Student ID from the responses
    const studentID = responses[0].getResponse();

    // We get the Data from the Proof of Enrollment
    const file = responses[1].getResponse();
    const fileContent = getTextFromPDF(file);

    /* 
      Several things are verified by the script for authenticity reasons. Between the things verified there is:

      - The student id is the same as the one of the PoE.
      - The period of the Proof of Enrollment is the actual one.
      - The situation of the student in the PoE is reflecting no problems.
      - The major the student is signed up is 'Computer Science Engineering', or the major in the variable `careerPath`.
     */
    if (
      fileContent.text.includes(studentID)
      && fileContent.text.includes(period)
      && fileContent.text.includes("Activo Normal")
      && fileContent.text.includes(studentMajor)
    ) {

      // Use of LockService to ensure no race condition is ever meet
      var lock = LockService.getDocumentLock();
      lock.waitLock(10000);

      try {
        const doc = SpreadsheetApp.openById(sheetkEY);
        var sheet = doc.getSheetByName("RESULTADOS");

        // Iteration over all the responses
        for (let i = 2; i < responses.length - 1; i++) {
          let countRow;

          // Check  the result
          if (responses[i].getResponse() === "A FAVOR") {
            countRow = 5;
          } else if (responses[i].getResponse() === "BLANCO") {
            countRow = 6;
          }

          // Get actual value
          var dataRange = sheet.getRange(countRow, i);
          var actual = dataRange.getValues();
          
          // UPDATE RESULT
          dataRange.setValues([[(parseInt(actual) + 1).toString()]]);

          // Log the candidate
          Logger.log('Update the candidate in column: ', i);
        }
        SpreadsheetApp.flush();
      } catch(e) {
        Logger.log('STUDENT ', studentID, ' FAILED BECAUSE OF LOCK.');
        Logger.log(e);
      } finally {
        // After sending the data, the Lock is set free for other awaiting proccesses
        lock.releaseLock();
      }
    } else {
      Logger.log('There has been a problem with the verification of the student: ', studentID);
    }
  } catch (f) {
    Logger.log(f);
  }
};
