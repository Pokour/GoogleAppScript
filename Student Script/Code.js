/*****************************************************************
 * Target Sheet is students sheet
 */

/*****************************************************************
 * Global Varables Declarations
 */
var userSrciptId = '';
var roleScriptId = '';
var roleIndex = 0;
var userIndex = 0;
var roleRecieved;
var actionRequested;
var library;

var sheetId = '';
var app = SpreadsheetApp;
var ss = app.openById(sheetId);
var sheet = ss.getSheetByName("users");

var heading = [];
var firstColumn;
var headLength;
var lastRowUser = 0;
var lastRowRole = 0;

var result = { users: {}, role: {}, workshop: {}, courses: {} };
var writeReturn = { userRow: 0, roleRow: 0, state: "null" };
var updateReturn = { userRow: 0, roleRow: 0, state: "null" };

/******************************************************************
 * Global variable array to hold the column values
 */
var studentHeading =
    ['add1', 'add2', 'add3', 'city', 'state', 'pincode', 'mobile', 'altmobile', 'instituteselected', 'institutelisted', 'institute',
        'standard', 'interest1', 'interest2', 'interest3', 'dob'];

/*****************************************************************
 * doGet() function call
 */
function doGet(event) {
    updateParameters(event);
    updateRoleParametrs(roleRecieved);
    takeAction(event);
    return callBack();
}

/*****************************************************************
 * Updating Global parameters
 */
function updateParameters(event) {
    roleScriptId = event.parameter.roleScriptId;
    userScriptId = event.parameter.userScriptId;
    roleIndex = event.parameter.rowIndex;
    userIndex = event.parameter.userIndex;
    roleRecieved = event.parameter.role;
    actionRequested = event.parameter.action;
    library = event.parameter.library;
}

/*****************************************************************
 * Updating role parameters
 */
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

/*****************************************************************
 * Action to be taken
 */
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

/*****************************************************************
 * Read request
 */
function readFromSheet() {
    result.users = getRowData(userRow, "users");
    result.role = getRowData(roleRow, roleRecieved);
}

/*****************************************************************
 * Update request
 */
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

/*****************************************************************
 * Write request
 */
function writeToSheet(event) {
    writeToUser(event);
    writeTorole(event);
}

/*****************************************************************
 * Write to USER Legacy code
 * #TOBE Updated with new logic
*/
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
    writeReturn.userRow = lastRowUser + 1;
    writeReturn.state = "DONE"
}


/*****************************************************************
 * Write to ROLE Legacy logic
 * # TOBE Modifiedd with new logic
 * 
*/
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
    writeReturn.roleRow = lastRowRole + 1;
    writeReturn.state = "DONE"
}

/*****************************************************************
 * Get the target row data
 */
function getRowData(pointer, targetSheet) {
    sheet = ss.getSheetByName(targetSheet);
    var tempMultiArray = sheet.getRange(pointer, firstColumn, 1, headLength).getValues();
    var simpleArray = tempMultiArray[0];
    return makeObject(heading, simpleArray);
}

/*****************************************************************
 * Make the retrieved data from sheet to OBJ
 */
function makeObject(keys, values) {
    var obj = {};
    for (i = 0; i < headLength; i++) {
        obj[keys[i]] = values[i];
    }
    Logger.log(obj);
    return obj;
}


/*****************************************************************
 * Return callback function
 */
function callBack() {
    if (actionRequested == "read") {
        return ContentService.createTextOutput(JSON.stringify(result))
            .setMimeType(ContentService.MimeType.JAVASCRIPT);
    } else if (actionRequested == "update") {
        return ContentService.createTextOutput(JSON.stringify(updateReturn))
            .setMimeType(ContentService.MimeType.JAVASCRIPT);
    } else if (actionRequested == "write") {
        return ContentService.createTextOutput(JSON.stringify(writeReturn))
            .setMimeType(ContentService.MimeType.JAVASCRIPT);
    }
}