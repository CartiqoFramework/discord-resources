# Discord resources

Bots, API libraries, tools, client modifications, subreddits and Discord's own pages, in one list.

Browse it at **[cartiqo.xyz/discord-resources](https://cartiqo.xyz/discord-resources)**. That page reads [`resources.json`](resources.json) from this repository, so a merged pull request shows up there within about an hour.

## Add a resource

Open a pull request that adds one entry to `resources.json`, at the end of the section it fits best:

```json
{
  "name": "discord.js",
  "url": "https://github.com/discordjs/discord.js",
  "description": "Discord API library for JavaScript."
}
```

[CONTRIBUTING.md](CONTRIBUTING.md) has the few rules an entry needs to follow. A check runs on every pull request.

## Use the data

`resources.json` is plain JSON, described by [`schema.json`](schema.json). Everything here is dedicated to the public domain under CC0, so you can use it anywhere without asking.

```
https://raw.githubusercontent.com/CartiqoFramework/discord-resources/main/resources.json
```

## Where it came from

The list started as [ProjectDiscord/awesome-discord](https://github.com/ProjectDiscord/awesome-discord). Entries whose links had stopped working were left out when it moved here.

## Licence

[CC0 1.0 Universal](LICENSE). Not affiliated with Discord Inc.
