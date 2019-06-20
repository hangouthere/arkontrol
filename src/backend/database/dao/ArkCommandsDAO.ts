import { IArkCommandEntry } from '../models/ArkCommands';
import BaseDAO from './base';

class ArkCommandsDAO extends BaseDAO {
  async getCommands() {
    return await this._db.all(`SELECT * FROM Commands ORDER BY "order" ASC`);
  }

  async saveCommands(commands: Array<IArkCommandEntry>) {
    await this._db.run('DELETE FROM Commands');

    await Promise.all(
      commands.map(cmd => {
        this._db.run('INSERT INTO Commands ("order", command) VALUES (?, ?)', cmd.order, cmd.command);
      })
    );
  }
}

export default ArkCommandsDAO;
