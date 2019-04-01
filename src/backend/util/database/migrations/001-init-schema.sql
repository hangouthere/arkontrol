-- Up 

CREATE TABLE Users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  userName TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  role TEXT NOT NULL,
  lastLogin TEXT
);
CREATE TABLE Players (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  userName TEXT NOT NULL UNIQUE,
  steamId TEXT NOT NULL UNIQUE,
  isOnline INTEGER NOT NULL,
  lastSeen TEXT
);
INSERT INTO
  Users (userName, role, password)
VALUES
  (
    'admin',
    'superadmin',
    '5ea985b7d8d896931ea774e17fe8c69a67f49202'
  );

-- Down 

DROP TABLE Users;
DROP TABLE Players;