-- Up

CREATE TABLE Users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  userName TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  roles TEXT NOT NULL,
  lastLogin TEXT
);
CREATE TABLE Players (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  userName TEXT NOT NULL UNIQUE,
  steamId TEXT NOT NULL UNIQUE,
  isOnline INTEGER NOT NULL,
  lastSeen TEXT
);
CREATE TABLE AuthConfig (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  propName TEXT NOT NULL UNIQUE,
  propValue TEXT NOT NULL,
  propDesc TEXT NOT NULL 
);
CREATE TABLE Commands (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  'order' INTEGER NOT NULL,
  command TEXT NOT NULL
);
CREATE TABLE AppState (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  propName TEXT NOT NULL UNIQUE,
  propValue TEXT NOT NULL
);

INSERT INTO Users (userName, roles, password)
VALUES
  (
    'admin',
    'superadmin ,admin',
    '5ea985b7d8d896931ea774e17fe8c69a67f49202'
  );

INSERT INTO AuthConfig (propName, propValue, propDesc)
VALUES 
  ('host', 'localhost', 'Hostname that points to your Ark Server.'),
  ('port', '27015', 'Port that your Ark Server RCON has exposed.'),
  ('password', 'adminPassword', 'Password for your RCON authentication.'),
  ('maxConnectionAttempts', '10', 'The number of times you want to retry connecting to the Server before giving up.'),
  ('maxPacketTimeouts', '5', 'The number of times to fail (TTF) for commands.<br />System auto-reconnects when limit reached.'),
  ('discordWebhookURL', '', 'The Discord WebHook URL to post the Server Status.<br />Leave blank to disable Discord Webhook integration.'),
  ('discordAdminName', 'Your Server Admin', 'The Discord user responsible for the Server availability.');

INSERT INTO Commands ('order', command)
VALUES 
  (1, 'broadcast <RichColor Color="0, 1, 0, 1">Congratulations!</> ArKontrol is operational!'),
  (2, 'wait 10'),
  (3, 'broadcast <RichColor Color="0.95, 0.45, 0.2, 1">Now go forth</>, and configure your Commands to run when you want!'),
  (4, 'wait 30');

INSERT INTO AppState (propName, propValue)
VALUES 
  ('serverWasDown', '0'),
  ('currentCommandIndex', '0');

-- Down

DROP TABLE Users;
DROP TABLE Players;
DROP TABLE AuthConfig;
DROP TABLE Commands;
DROP TABLE AppState;