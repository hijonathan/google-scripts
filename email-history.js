// Simple way to test annotateEmailHistory without an active sheet.
function test() {
  var sheet = SpreadsheetApp.openById('<YOUR_SPREADSHEET_ID>');
  annotateEmailHistory(sheet);
}


/**
 * Looks for a column called 'Email' (case-insensitive) and inserts an adjacent
 * column of 'Emails sent'. It then loops through the email addresses and records
 * how many emails you've had with that person.
 *
 * Very useful for identifying how active you've been with a person. Works great when
 * the spreadsheet is populated with data from a CRM that doesn't record your Gmail
 * correspondences.
 */
function annotateEmailHistory(sheet) {
  if (!sheet) {
    sheet = SpreadsheetApp.getActiveSheet();
  }
  var rows = sheet.getDataRange();
  var numRows = rows.getNumRows();
  var numCols = rows.getNumColumns();
  var values = rows.getValues();

  var firstRow = values[0];
  var emailColIndex;
  for (var i = 0; i <= numCols - 1; i++) {
    var colValue = firstRow[i];
    if (RegExp(colValue, 'i').test('email')) {
      Logger.log('Email column found at index: ' + i);
      emailColIndex = i + 1;
      break;
    }
  }

  if (!emailColIndex) {
    Logger.log('No email column found.');
    return;
  }

  // Insert a new column to hold annotations.
  // Note: if run multiple times, you'll get duplicate columns.
  sheet.insertColumnAfter(emailColIndex);
  var annotationColIndex = emailColIndex + 1;
  var cell = sheet.getRange(1, annotationColIndex, 1);
  cell.setValue('Emails sent');

  for (var i = 1; i <= numRows - 1; i++) {
    var row = values[i],
        email = row[emailColIndex - 1];
    var numEmailsSent = getNumEmails(email);
    var cell = sheet.getRange(i + 1, annotationColIndex, 1);
    cell.setValue(numEmailsSent);
  }
};

// Searches Gmail for emails by that person.
// TODO: Could be optimized by making one big call to Gmail for
// all email addresses, then parsing that subset.
function getNumEmails(email) {
  var threads = GmailApp.search('from:me to:' + email);
  return threads.length;
}

/**
 * Adds a custom menu to the active spreadsheet, containing a single menu item
 * for invoking the readRows() function specified above.
 * The onOpen() function, when defined, is automatically invoked whenever the
 * spreadsheet is opened.
 * For more information on using the Spreadsheet API, see
 * https://developers.google.com/apps-script/service_spreadsheet
 */
function onOpen() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet();
  var entries = [{
    name : "Annotate Email History",
    functionName : "annotateEmailHistory"
  }];
  sheet.addMenu("Script Center Menu", entries);
};
