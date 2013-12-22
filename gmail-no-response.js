var unrespondedLabel = 'No Response',
    ignoreLabel = 'Ignore No Response',
    maxDays = 14;

function main() {
  processUnresponded();
  cleanUp();
}

function processUnresponded() {
  var threads = GmailApp.search('is:sent from:me -in:chats older_than:5d newer_than:' + maxDays + 'd'),
      numUpdated = 0;

  // Filter threads where I was the last respondent.
  for (var i = 0; i < threads.length; i++) {
    var thread = threads[i],
        messages = thread.getMessages(),
        lastMessage = messages[messages.length - 1],
        lastFrom = lastMessage.getFrom();

    if (fromMe(lastFrom) && !threadHasLabel(thread, ignoreLabel)) {
      markUnresponded(thread);
      numUpdated++;
    }
  }

  Logger.log('Updated ' + numUpdated + ' messages.');

}

function getEmailAddresses() {
  var me = Session.getActiveUser().getEmail(),
      emails = GmailApp.getAliases();

  emails.push(me);
  return emails;
}

function fromMe(fromAddress) {
  var addresses = getEmailAddresses();
  for (i = 0; i < addresses.length; i++) {
    var address = addresses[i],
        r = RegExp(address);

    if (r.test(fromAddress)) {
      return true;
    }
  }

  return false;
}

function threadHasLabel(thread, labelName) {
  var labels = thread.getLabels();

  for (i = 0; i < labels.length; i++) {
    var label = labels[i];

    if (label.getName() == labelName) {
      return true;
    }
  }

  return false;
}

function markUnresponded(thread) {
  var label = getLabel(unrespondedLabel);
  label.addToThread(thread);
}

function getLabel(labelName) {
  var label = GmailApp.getUserLabelByName(labelName);

  if (label) {
    Logger.log('Label exists.');
  } else {
    Logger.log('Label does not exist. Creating it.');
    label = GmailApp.createLabel(labelName);
  }

  return label;
}

function cleanUp() {
  var label = getLabel(unrespondedLabel),
      iLabel = getLabel(ignoreLabel),
      threads = label.getThreads(),
      numExpired = 0;

  if (!threads.length) {
    Logger.log('No threads with that label');
    return;
  }

  for (i = 0; i < threads.length; i++) {
    var thread = threads[i],
        lastMessageDate = thread.getLastMessageDate(),
        twoWeeksFromNow = new Date();

    twoWeeksFromNow.setDate(twoWeeksFromNow.getDate() + maxDays);

    // Remove the 'No Response' label from threads we're ignoring.
    if (threadHasLabel(thread, ignoreLabel)) {
        label.removeFromThread(thread);
    }

    // Remove all labels from expired threads.
    if (lastMessageDate.getTime() > twoWeeksFromNow.getTime()) {
      numExpired++;
      label.removeFromThread(thread);
      iLabel.removeFromThread(thread);
    }
  }
  Logger.log(numExpired + ' unresponded messages expired.');
}
