/**
Create backups of the data returned by any URL and save them to Google Drive.
This is going to create a folder structure that looks like this:

/Backups
    /2014-01-01
        /2014-01-01T00:00:00.html
        /2014-01-01T01:00:00.html
        /2014-01-01T02:00:00.html
        .. etc..
*/

var RESOURCE_URL = 'https://news.ycombinator.com/news',
    BACKUP_FOLDER_ID = '<THE_ID_OF_THE_FOLDER_WHERE_YOUR_BACKUPS_WILL_LIVE>',
    FOLDER_NAME_FORMAT = 'yyyy-MM-dd',
    FILE_NAME_FORMAT = "yyyy-MM-dd'T'HH:00:00",

    // Customize your file extension.
    FILE_EXT = '.html',

    // Folder names are all going to look like this.
    now = new Date(),
    FOLDER_NAME = Utilities.formatDate(now, 'GMT', FOLDER_NAME_FORMAT),
    FILE_NAME = Utilities.formatDate(now, 'GMT', FILE_NAME_FORMAT) + FILE_EXT;


function createBackup() {
    var folder = getFolder(FOLDER_NAME);
    createBackupFile(folder, FILE_NAME, fetchData());
}

// Ensures we're always working within the backup directory.
function getFolder(name) {
    var backupFolder = getBackupFolder(),
        folders = backupFolder.getFoldersByName(name);

    if (folders.hasNext()) {
        // Just get the first one.
        folder = folders.next();
    } else {
        folder = backupFolder.createFolder(name);
    }
    return folder;
}

// Returns the root folder where our backups exist.
function getBackupFolder() {
    return DriveApp.getFolderById(BACKUP_FOLDER_ID);
}

function createBackupFile(folder, filename, data, overwrite) {
    if (overwrite) {
        // Techincally we're not overwriting here. We're just deleting
        // the duplicates.
        var existingFiles = folder.getFilesByName(filename);
        while (existingFiles.hasNext()) {
            var file = existingFiles.next();
            folder.removeFile(file);
        }
    }
    folder.createFile(filename, data);
}

// NOTE: You could change this URL to be anything you want.
function fetchData() {
    var exportUrl = RESOURCE_URL;
    return UrlFetchApp.fetch(exportUrl);
}
