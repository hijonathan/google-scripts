/*
 * This script goes through your Gmail Inbox and finds recent emails where you
 * were the last respondent. It applies a nice label to them, so you can
 * see them in Priority Inbox or do something else.
 *
 * To remove and ignore an email thread, just remove the unrespondedLabel and
 * apply the ignoreLabel.
 *
 * This is most effective when paired with a time-based script trigger.
 *
 * For installation instructions, read this blog post:
 * http://jonathan-kim.com/2013/Gmail-No-Response/
 */


// Edit these to your liking.
var unrespondedLabel = 'No Response',
    ignoreLabel = 'Ignore No Response',
    minDays = 5,
    maxDays = 14;

function main() {
  processUnresponded();
  cleanUp();
}

function processUnresponded() {
  var threads = GmailApp.search('is:sent from:me -in:chats older_than:' + minDays + 'd newer_than:' + maxDays + 'd'),
      numUpdated = 0,
      minDaysAgo = new Date();

  minDaysAgo.setDate(minDaysAgo.getDate() - minDays);

  // Filter threads where I was the last respondent.
  for (var i = 0; i < threads.length; i++) {
    var thread = threads[i],
        messages = thread.getMessages(),
        lastMessage = messages[messages.length - 1],
        lastFrom = lastMessage.getFrom(),
        lastMessageIsOld = lastMessage.getDate().getTime() < minDaysAgo.getTime();

    if (isFromMe(lastFrom) && lastMessageIsOld && !threadHasLabel(thread, ignoreLabel)) {
      markUnresponded(thread);
      numUpdated++;
    }
  }

  Logger.log('Updated ' + numUpdated + ' messages.');
}

function isFromMe(fromAddress) {
  var addresses = getEmailAddresses();
  for (i = 0; i < addresses.length; i++) {
    var address = addresses[i],
        r = RegExp(address, 'i');

    if (r.test(fromAddress)) {
      return true;
    }
  }

  return false;
}

function getEmailAddresses() {
  var me = Session.getActiveUser().getEmail(),
      emails = GmailApp.getAliases();

  emails.push(me);
  return emails;
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
      numExpired = 0,
      twoWeeksAgo = new Date();

  twoWeeksAgo.setDate(twoWeeksAgo.getDate() - maxDays);

  if (!threads.length) {
    Logger.log('No threads with that label');
    return;
  } else {
    Logger.log('Processing ' + threads.length + ' threads.');
  }

  for (i = 0; i < threads.length; i++) {
    var thread = threads[i],
        lastMessageDate = thread.getLastMessageDate();

    // Remove all labels from expired threads.
    if (lastMessageDate.getTime() < twoWeeksAgo.getTime()) {
      numExpired++;
      Logger.log('Thread expired');
      label.removeFromThread(thread);
      iLabel.removeFromThread(thread);
    } else {
      Logger.log('Thread not expired');
    }
  }
  Logger.log(numExpired + ' unresponded messages expired.');
}
