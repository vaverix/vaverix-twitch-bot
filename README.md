
# vaverix-twitch-bot

Desktop application that allows you to log-in into multiple Twitch.tv channels at once. It also notifies you when someone mentions you in any channel you choose and has couple of other extra features.
It is more lightweight for your PC's CPU and memory comparing to web browser with many Twitch.tv tabs opened, and it can be left running in the background.

Doesn't matter if you wanna grind channel points or just be aware if someone is talking about you, this app is for you!

![Screenshot](screen1.png)

![Screenshot](screen2.png)

![Screenshot](screen3.png)

## Getting Started

Just head to [releases](https://github.com/vaverix/vaverix-twitch-bot/releases) page, download .exe and run it!

### Windows SmartScreen

If Windows Defender SmartScreen blocks the app from running, you can just click "Read more" and then click "Run". Don't worry, it's perfectly safe, it pops-up because I don't sign the installer with Microsoft certificate. You can even check the source code and compile the app yourself!

![Screenshot](smartscreen.png)

### Compiling yourself

The use of the [yarn](https://yarnpkg.com/) package manager is **strongly** recommended, as opposed to using `npm`.
Make sure to check out [`electron-webpack`'s documentation](https://webpack.electron.build/) for more details.

```bash
git clone https://github.com/vaverix/vaverix-twitch-bot.git
cd vaverix-twitch-bot
rm -rf .git

# install dependencies
yarn
```

### Development Scripts

```bash
# run application in development mode
yarn dev

# compile source code and create webpack output
yarn compile

# `yarn compile` & create build with electron-builder
yarn dist

# `yarn compile` & create unpacked build with electron-builder
yarn dist:dir
```
