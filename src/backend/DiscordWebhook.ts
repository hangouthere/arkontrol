import ConfigParser from './util/ConfigParser';
import fetch from 'node-fetch';

const COLOR_DOWN = 16711680;
const COLOR_UP = 65280;

const STATUS_DESC_DOWN =
  'ArKontrol cannot connect to the Ark server!\n\n' +
  'This may mean the server has crashed, but may also mean it was taken down intentionally.';
const STATUS_DESC_UP = 'ArKontrol has re-established connectivity with the Ark server!';

const INFO_TITLE_DOWN = "Don't Freak out!";
const INFO_TITLE_UP = 'Woo Hoo!';
const INFO_DESC_DOWN = 'will get the server up as soon as possible!';
const INFO_DESC_UP = 'Feel free to hop on and get to playing!';

class DiscordWebhook {
  async send(isUp: boolean) {
    const DiscordConfig = ConfigParser.config.discord;

    const payload = {
      content: 'Ark Server Status Update...',
      embeds: [
        {
          description: isUp ? STATUS_DESC_UP : STATUS_DESC_DOWN,
          color: isUp ? COLOR_UP : COLOR_DOWN,
          timestamp: new Date().toISOString(),
          author: {
            name: `Server has gone ${isUp ? 'UP' : 'DOWN'}!`
          }
        },
        {
          title: isUp ? INFO_TITLE_UP : INFO_TITLE_DOWN,
          description: isUp ? INFO_DESC_UP : `${DiscordConfig.discordAdminName} ${INFO_DESC_DOWN}`
        }
      ]
    };

    return fetch(DiscordConfig.discordWebhookURL, {
      method: 'POST',
      body: JSON.stringify(payload),
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

export default new DiscordWebhook();
