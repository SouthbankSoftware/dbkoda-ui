/**
 * @Author: chris
 * @Date:   2017-05-17T13:39:35+10:00
 * @Email:  chris@southbanksoftware.com
 * @Last modified by:   chris
 * @Last modified time: 2017-05-19T11:29:02+10:00
 */
global.Globalize = require('globalize');
const messages = require('~/messages/en.json');

export default function globalizeInit() {
  global.globalString = (path, ...params) => Globalize.messageFormatter(path)(...params);
  Globalize.load(
    require('cldr-data').entireSupplemental(),
    require('cldr-data').entireMainFor('en')
  );
  Globalize.locale('en');
  Globalize.loadMessages(messages);
}
