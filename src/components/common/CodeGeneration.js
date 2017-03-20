/**
* @Author: Wahaj Shamim <wahaj>
* @Date:   2017-03-17T10:29:12+11:00
* @Email:  wahaj@southbanksoftware.com
 * @Last modified by:   wahaj
 * @Last modified time: 2017-03-20T17:18:05+11:00
*/

export default class CodeGeneration {
  static get templates() {
    return {
      serverNode: (hostPortName) => {
        const server = hostPortName.split(':');
        return `connect(${server[0]}:${server[1]}/admin);\ndb.auth($username, $password);`; // TODO:Get userId/Pass from profile
      },
      databaseNode: (dbName) => {
        return `use ${dbName};\n`;
      },
      collectionNode: (colName) => {
        return `db.${colName}.findOne();\n`;
      },
      indexNode: (indexName) => {
        return `db.${indexName}.getIndexes();\n`;
      },
      usersNode: () => {
        return 'use admin;db.system.users.find({},{_id:1,"user":1,"db":1,"roles":1}).pretty();\n';
      },
      userNode: (userName) => {
        return `use admin;db.system.users.find({user:${userName}},{_id:1,"user":1,"db":1,"roles":1}).pretty();\n`;
      }
    };
  }
  static getCodeForTreeNode(treeNode) {
    switch (treeNode.type) {
      case 'shard':
      case 'shards':
        return 'sh.status();\n';
      case 'configservers':
        return 'db.runCommand("getShardMap");\n';
      case 'config':
        return CodeGeneration.templates.serverNode(treeNode.label);
      case 'routers':
      case 'mongos':
        return '';
      case 'databases':
        return 'db.getCollectionNames();\n'
      case 'database':
        return CodeGeneration.templates.databaseNode(treeNode.label);
      case 'collection':
        return CodeGeneration.templates.collectionNode(treeNode.label);
      case 'index':
        return CodeGeneration.templates.indexNode(treeNode.refParent.text);
      case 'users':
        return CodeGeneration.templates.usersNode();
      case 'user':
        return CodeGeneration.templates.userNode(treeNode.label);
      default:
        return null;
    }
  }
}
