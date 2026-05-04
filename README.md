# MONO

A TUI encyclopedia via SSH where every word is a link.

Inspired by [Wikipedia](https://www.wikipedia.org/) and also the [Library of Babel](https://libraryofbabel.info/)

## Stack
TUI
- Terminal interface is build using [OpenTUI](https://opentui.com/) by Anomaly
- Uses the React bindings for components and react patterns
- Connecting with the AI/LLM services by [AI-SDK](https://ai-sdk.dev/) by Vercel
- Written in the beautiful TypeScript by Google 

SSH Server
- Uses the amazing [wish](https://github.com/charmbracelet/wish) by charm to serve the TUI over SSH. 
- Written in Go

## Usage
- Shift + R: Random word
- Input bar: Click via mouse, then type new subject, enter to submit
- (Shift) Tab: Navigating the article, enter for new topic

### Prerequisites
- Bun v1.3.10
- Go v1.26.1
- Set up .env (env is loaded automatically, by the godotenv package and bun natively)
    - root directory:
        - AI_GATEWAY_API_KEY (your Vercel's AI gateway Key)
        - HOST
        - PORT
        - TUI_ENTRY e.g. packages/tui/dist/@mono/tui-darwin-arm64/bin/mono depending on your machines architecture
    - packages/tui/
        - AI_GATEWAY_API_KEY (your Vercel's AI gateway Key)

### Installation
1. ``` bun install ```
2. ``` go mod tidy ```

### Development
For server:
```shell
bun run dev:sshd
```

For TUI-only:
```shell
cd packages/tui
bun run dev
```

### Building
```shell
bun run build
```
Server-Out: /bin directory contains the 
TUI-Out: packages/tui/dist contains the binaries for the different architectures.

## Deployment
`The output of the build is in the /bin directory. Run the executable and you should be ready to go.`   

Possible breaking points:
- Firewall
- No permision to mount to the host
- Conflicting with other ssh services
- Permission misconfiguration
- No SSH Keys
- And lastly no .env file

### Running with SystemD
If you use a new user for each app (which is good), you'll need to create them
first:

```bash
useradd --system --user-group --create-home myapp
```

`/etc/systemd/system/myapp.service`:
```service
[Unit]
Description=Mono
After=network.target

[Service]
Type=simple
User=mono
Group=mono
WorkingDirectory=/home/mono/mono
EnvironmentFile=/home/mono/mono/.env
ExecStart=/home/mono/mono/bin/sshd
Restart=on-failure

[Install]
WantedBy=multi-user.target
```

```bash
# need to run this every time you change the unit file
sudo systemctl daemon-reload

# start/restart/stop/etc:
sudo systemctl start myapp
```


## This project is part of [HCTG](https://game.hackclub.com/) by Hackclub.