/**
* @Author: Michael Harrison <Mike>
* @Date:   2017-03-24 14:58:55
* @Email:  mike@southbanksoftware.com
* @Last modified by:   mike
* @Last modified time: 2017-03-24 14:59:00
*/

// List of words:
/**
 * db
 * db.help()
 * db.*.help()
 * show
 * show dbs
 * use
 * show collections
 * show users
 * show roles
 * show profile
 * show databases
 */

export default class EditorHighlighter {

  static defaultOverlay(stream) {
    if (stream.match('db')) {
      return 'mongo-keyword-db';
    } else if (stream.match('show')) {
      return 'mongo-keyword-show';
    } else if (stream.match('dbs')) {
      return 'mongo-keyword-dbs';
    } else if (stream.match('use')) {
      return 'mongo-keyword-use';
    } else if (stream.match('collections')) {
      return 'mongo-keyword-collections';
    } else if (stream.match('users')) {
      return 'mongo-keyword-users';
    } else if (stream.match('roles')) {
      return 'mongo-keyword-roles';
    } else if (stream.match('profile')) {
      return 'mongo-keyword-profile';
    } else if (stream.match('databases')) {
      return 'mongo-keyword-databases';
    }
    while (stream.next() != null
      && !stream.match('db', false)
      && !stream.match('show', false)
      && !stream.match('dbs', false)
      && !stream.match('use', false)
      && !stream.match('collections', false)
      && !stream.match('users', false)
      && !stream.match('roles', false)
      && !stream.match('profile', false)
      && !stream.match('databases', false)
    ) {} // eslint-disable-line
    return null;
  }
}
