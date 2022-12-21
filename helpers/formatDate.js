const moment = require('moment');

function formatMessage(username, text, image) {
  return {
    username,
    text,
    image,
    time: moment().format('h:mm a')
  };
}

module.exports = formatMessage;