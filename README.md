# `devexbot`

## Send custom developer experience surveys using Slack

---

This project enables you to easily set up and run developer experience surveys on Slack.

Developer experience surveys are a great way to get concrete, honest feedback on what is (and what isn't) working in your organization right now around areas such as perceived ease of delivering software, perceived productivity, and employee satisfaction.

Features includes:

- Configurable texts, questions, and options
- Comes with sane defaults
- Requires only that you set up a bot app in Slack

_You might also be interested in [this full solution](TODO), which is deployable on AWS and includes all components such as API management, functions, and storage, as well as support for Slack's slash commands for opting in/out users._

---

## Solution

Code is written in [TypeScript](https://www.typescriptlang.org), bundled with [ncc](https://github.com/vercel/ncc), and tested with [AVA](https://github.com/avajs/ava). Errors are logged with [mikrolog](https://github.com/mikaelvesavuori/mikrolog).

## Installation

Install the dependencies with `npm install` or your equivalent command.

## Defaults

### Standard questions

1. How has your day been?
2. Did you make progress toward your goals today?
3. Have you been able to focus today?
4. Is your tooling working well and fast?
5. Is the cognitive load manageable?

### Standard configuration

```json
{
  "heading": "Developer Experience survey",
  "optionsPlaceholder": "I feel...",
  "finishHeading": "*Finish*",
  "finishButtonText": "Finish the survey :tada:",
  "optInMessage": "You are now opted-in to the developer experience survey!",
  "optOutMessage": "You are now opted-out from the developer experience survey.",
  "completedMessage": "Thanks for taking the time to share with us!",
  "questions": [
    "*1. How has your day been?*",
    "*2. Did you make progress toward your goals today?*\nConsider the clarity of goals, how engaging the work is, your control of the structure of work...",
    "*3. Have you been able to focus today?*\nConsider the number of meetings, interruptions, unplanned work...",
    "*4. Is your tooling working well and fast?*\nConsider CI, code tools, platform tools, build and test times, code review times...",
    "*5. Is the cognitive load manageable?*\nConsider project complexity, friction, processes, communication..."
  ],
  "options": [
    {
      "text": "Positive",
      "value": "positive"
    },
    {
      "text": "Neutral",
      "value": "neutral"
    },
    {
      "text": "Negative",
      "value": "negative"
    }
  ]
}
```

## Usage

### Prep: Setting up your DevEx app in Slack

- [Create a Slack app](https://api.slack.com/authentication/basics). Set it to whatever name you want.
- In `OAuth & Permissions`, make sure that the following scopes are enabled: `chat:write`, `commands`, and `users:read`. **Note down the "Bot User OAuth Token"**.
- --> `SLACK_AUTH_TOKEN` - The key to authorize your call to Slack (TODO)

### Example: Open a survey to a list of users

```ts
import { createNewDevExSurvey } from 'devexbot';

const authToken = 'my-auth-token';
const userIds = ['U123456789', 'U987654321'];

const devex = createNewDevExSurvey({ authToken });
await devex.open(userIds);
```

### Custom configuration

The custom configuration will merge the base configuration (see above) with your own configuration options.

Basic validation is done to check for empty values, correct options objects, and ensuring questions and options have a non-zero length.

Most types are exported, so you can use these in your own code to make it easier to write.

```ts
import { createNewDevExSurvey, DevExSurveyConfigurationInput } from 'devexbot';

const authToken = 'my-auth-token';
const config = {
  "heading": "Our weekly DX check-in!",
  "optionsPlaceholder": "I thought it was...",
  "questions": [
    "*1. How well has the tooling worked this week?*",
  ],
  "options": [
    {
      "text": "Super",
      "value": "super"
    },
    {
      "text": "OK",
      "value": "ok"
    },
    {
      "text": "Bad",
      "value": "bad"
    }
  ]
};
const userIds = ['U123456789', 'U987654321'];

const devex = createNewDevExSurvey({ authToken, config });
devex.open(userIds);
```

## Behaviors and limitations

- You need to supply a list of user IDs for `devexbot` to send anything. The reason for this is quite simple: All surveys are personal and private, and to send such a message, we need to send them to each individual user with Slack's `chat.postMessage` API method.
- It is not possible to "close" open (unanswered) surveys in the current state of the implementation. Once a survey is opened, it stays open _until the user acts on it_. This does not seem like something that needs to be implemented - see below.

---

## References

### Developer experience surveys

- [The SPACE of Developer Productivity](https://queue.acm.org/detail.cfm?id=3454124)
- [DevEx: What Actually Drives Productivity](https://queue.acm.org/detail.cfm?id=3595878)
- [Octoverse Spotlight 2021: The Good Day Project—Personal analytics to make your work days better](https://github.blog/2021-05-25-octoverse-spotlight-good-day-project/)
- [Abi Noda on Substack](https://substack.com/@abinoda)

### Slack

- [Reference: Block elements](https://api.slack.com/reference/block-kit/block-elements#button)
- [Creating interactive messages](https://api.slack.com/messaging/interactivity)
- [Handling user interaction in your Slack apps](https://api.slack.com/interactivity/handling)
