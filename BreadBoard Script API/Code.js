/*
author: Utsav Singh | email address | Contact Number
Accepts GET request from WebApps using query parameters.
1. Check for the role type: [student / collaborator / institution]
2. updates global variables from the recieved data from query params.
3. check for the action type from the query parameters action = [read / update / write]
4. Logic to prform the required action on the sheet data.
5. make an object with the return data to the WebApp using contentService()
*/

/****************************************************************
 * Global objects with structures to carry the returns according to
 * actions taken
 */
var result = { users: {}, role: {}, workshop: {}, courses: {} };
var writeReturn = { userRow: 0, roleRow: 0, state: "null" };
var updateReturn = { userRow: 0, roleRow: 0, state: "null" };

/****************************************************************
 * Global variable array to hold the column values that are
 * headings in the Google sheets
 */
var studentHeading =
  ['add1', 'add2', 'add3', 'city', 'state', 'pincode', 'mobile', 'altmobile', 'instituteselected', 'institutelisted', 'institute',
    'standard', 'interest1', 'interest2', 'interest3', 'dob'];
var collaboratorHeading =
  ['add1', 'add2', 'add3', 'city', 'state', 'pincode', 'mobile', 'altmobile', 'instituteselected', 'institutelisted', 'institute',
    'collegeselected', 'collegelisted', 'college', 'Degree', 'startdate', 'enddate', 'interest1', 'interest2', 'interest3', 'dob'];
var instituteHeading =
  ['add1', 'add2', 'add3', 'city', 'state', 'pincode', 'office', 'officeemail', 'officephone', 'principal', 'principalemail',
    'principalphone', 'poc', 'pocemail', 'pocphone'];
var userHeaading = ['add1', 'add2', 'add3', 'city', 'state', 'pincode', 'mobile', 'altmobile', 'instituteselected', 'institutelisted', 'institute',
    'standard', 'interest1', 'interest2', 'interest3', 'dob'];

/**************************************************************
 * Global variables for baic metadata to be used in the action
 */
var userRow = 0;
var roleRow = 0;
var roleRecieved;
var actionRequested;
var library;
var roleIndex;

/**************************************************************
 * Global variable to target the sheet to be used.
 */
var sheetId = '1tsb_MKAESDafYsi3C_lhaC0HLu_YyJ0BbxoXv9xkNRA';
var app = SpreadsheetApp;
var ss = app.openById(sheetId);
var sheet = ss.getSheetByName("users");

/**************************************************************
 * Global variable others
 */
var heading = [];
var firstColumn;
var headLength;
var lastRowUser=0;
var lastRowRole=0;

//********************************************* doGet() STARTS HERE ********************************************* 
function doGet(event) {
  // Update the parametrs passed from the url to the global variables
  updateParameters(event);
  // Update of parameters specific to the role selected
  updateRoleParametrs(roleRecieved);
  // Action refers to the type of transaction requested
  takeAction(event);
  // call back has to be updated according to the transaction requested
  return callBack();

}
//********************************************* doGet() ENDS HERE ********************************************* 

/*************************************************************
 * 1. update parameters(event) is used to extract the parameters
 *    recieved fom the url and store it to the global variables
 * 2. These variables are used to target the data in the sheets
 *    by userRow, roleRow, roleRecieved, actionRequested, library
 */
function updateParameters(event) {
  userRow = event.parameter.userPointer;
  roleRow = event.parameter.rolePointer;
  roleRecieved = event.parameter.role;
  actionRequested = event.parameter.action;
  library = event.parameter.library;
  roleIndex = event.parameter.roleIndex;
}

function updateRoleParametrs(roleRecieved) {
  if (roleRecieved == "student") {
    heading = studentHeading;
    firstColumn = 3;
    headLength = studentHeading.length;
  } else if (roleRecieved == "collaborator") {
    heading = collaboratorHeading;
    firstColumn = 3;
    headLength = heading.length;
  } else if (roleRecieved == "institute") {
    heading = instituteHeading;
    firstColumn = 3;
    headLength = heading.length;
  }
}

function takeAction(event) {
  if (actionRequested == "read") {
    readFromSheet();
  } else if (actionRequested == "update") {
    updateSheet(event);
  } else if (actionRequested == "write") {
    writeToSheet(event);
    Logger.log("WRITE ACTION")
  }
}

function readFromSheet() {
  result.users = getRowData(userRow, "users");
  result.role = getRowData(roleRow, roleRecieved);
}

function getRowData(pointer, targetSheet) {
  sheet = ss.getSheetByName(targetSheet);
  var tempMultiArray = sheet.getRange(pointer, firstColumn, 1, headLength).getValues();
  var simpleArray = tempMultiArray[0];
  return makeObject(heading, simpleArray);
}

// This function takes 2 arrays and convert into object with key and value from arrays and return object
function makeObject(keys, values) {
  var obj = {};
  for (i = 0; i < headLength; i++) {
    obj[keys[i]] = values[i];
  }
  Logger.log(obj);
  return obj;
}

function updateSheet(event) {
  var temp = [];
  var dataarray = [[]];
  for (i = 0; i < headLength; i++) {
    temp[i] = event.parameter[heading[i]];
  }
  dataarray[0] = temp;
  sheet = ss.getSheetByName(roleRecieved);
  sheet.getRange(roleRow, firstColumn, 1, headLength).setValues(dataarray);
  updateReturn.roleRow = roleRow;
  updateReturn.userRow = "UNTOUCHED"
  updateReturn.state = "DONE";
}

function writeToSheet(event) {
  writeToUser(event);
  writeTorole(event);
}

function writeToUser(event) {
  var ulength = userHeaading.length;
  var temp = [];
  var dataarray = [[]];
  var uidarray = [event.parameter.uid];
  sheet = ss.getSheetByName("users");
  lastRowUser = sheet.getLastRow();
  for (i = 0; i < ulength; i++) {
    temp[i] = event.parameter[userHeaading[i]];
  }
  temp = uidarray.concat(temp);
  dataarray[0] = temp;
  sheet.getRange(lastRowUser + 1, firstColumn - 1, 1, ulength + 1).setValues(dataarray);
  writeReturn.userRow = lastRowUser+1;
  writeReturn.state = "DONE"
}

function writeTorole(event) {
  var rlength = headLength;
  var temp = [];
  var dataarray = [[]];
  var uidarray = [event.parameter.uid];
  sheet = ss.getSheetByName(roleRecieved);
  lastRowRole = sheet.getLastRow();
  for (i = 0; i < rlength; i++) {
    temp[i] = event.parameter[heading[i]];
  }
  temp = uidarray.concat(temp);
  dataarray[0] = temp;  
  sheet.getRange(lastRowRole + 1, firstColumn - 1, 1, rlength + 1).setValues(dataarray);
  writeReturn.roleRow = lastRowRole+1;
  writeReturn.state = "DONE"
}

function callBack() {
  if(actionRequested == "read") {
    return ContentService.createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JAVASCRIPT);
  }else if (actionRequested == "update") {
    return ContentService.createTextOutput(JSON.stringify(updateReturn))
    .setMimeType(ContentService.MimeType.JAVASCRIPT);
  }else if (actionRequested == "write") {
    return ContentService.createTextOutput(JSON.stringify(writeReturn))
    .setMimeType(ContentService.MimeType.JAVASCRIPT);
  }
}