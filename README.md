# Hytale Minimal Panel

![Panel](doc/hytale-panel.png)

## Installation

### Manual installation

- Clone this repository
- Set environnement variables from .env.example
    - Either create a `.env` file
    - Or setup environnement variables on your system


#### From source

- npm i
- npm run dev
- Go to http://localhost:3000

#### With docker compose

- docker compose up
- Check the port allocated with `docker ps`, on hytale-manager `0.0.0.0:XXXXX->80/tcp`
- Go to http://localhost:XXXXX

### Dokploy installation

- Set the Git provider with this repository URL
- Copy .env.example in Environment, and adapt values
- Click on build
- Setup a domain, with Service Name `hytale-manager` and Container Port `80` 


## Import your world

Once the app is running, you can import a world directly from the panel.


- Go to your world folder

You should have a structure like that:
```
.
├── bans.json
├── config.json
├── logs
├── mods
│   ├── RandomMod1
│   └── RandomMod2
├── permissions.json
├── universe
│   ├── memories.json
│   ├── players
│   └── worlds
└── whitelist.json
```

- Zip this folder
- On panel, go to Backups page
- Import your zip file
- Restore the backup you've just imported (it may take a while depending on the size)