/**
 * Hi this is a sand alone script not associated with any sheet
 */
function myFunction() {
 Logger.log('logging function works');
}


//function doPost (request) {
// Logger.log('POST LOG');
// return ContentService.createTextOutput('POST WORKS');
//}

function doGet(e) {
 Logger.log('GET LOG');
 return ContentService.createTextOutput(JSON.stringify('GET FUNCTION IS WORKING'))
    .setMimeType(ContentService.MimeType.JAVASCRIPT);
}


function doPost (request) {
  Logger.log('POST IS WORKING',request);
//  return ContentService.createTextOutput('POST WORKS!');
  return ContentService.createTextOutput(JSON.stringify(request))
    .setMimeType(ContentService.MimeType.JAVASCRIPT);
};