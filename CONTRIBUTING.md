# Contributing

Thanks for adding to the list. Every change goes through a pull request, and a check runs on each one.

## An entry

Each entry in `resources.json` has three fields:

- **`name`**: what the resource is called, the way its own site writes it.
- **`url`**: an `https://` link straight to the resource. No referral, affiliate or tracking links.
- **`description`**: one or two sentences on what it does, starting with a capital letter and ending with a full stop. Say what it does rather than how good it is.

Add it at the end of the section it fits best. If no section fits, add a new one in the same pull request and explain why in the pull request description.

A bot invite link should ask for the permissions the bot needs. The check turns away invites that ask for Administrator.

## What is left out

- Links that do not load, or that do not lead to the resource.
- Anything already in the list.
- Selfbots, raid tools, token grabbers, and anything else built to abuse Discord or the people on it.

## The checks

Two scripts run on every pull request. Both need Node 20 or newer and nothing else:

```sh
node scripts/validate.mjs     # the format, duplicates and invite permissions
node scripts/check-links.mjs  # that the links load
```

Maintainers may shorten a description or move an entry to another section before merging.

By contributing, you agree that your contribution is dedicated to the public domain under [CC0 1.0](LICENSE), like the rest of the list.
