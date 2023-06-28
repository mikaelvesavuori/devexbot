/**
 * @description Required input for the `DevExSurvey`.
 */
export type DevExSurveyOptions = {
  authToken: string;
  config?: DevExSurveyConfigurationInput;
};

/**
 * @description The configuration to use with `DevExSurvey`.
 */
export type DevExSurveyConfiguration = {
  /**
   * Heading text for the survey. Supports plain text only.
   */
  heading: string;
  /**
   * The empty state text in the options selection box.
   */
  optionsPlaceholder: string;
  /**
   * What the submission part heading says. Supports markdown.
   */
  finishHeading: string;
  /**
   * What the submission button says. Supports plain text only.
   */
  finishButtonText: string;
  /**
   * What the message says that is returned for users who have opted in to the survey.
   */
  optInMessage: string;
  /**
   * What the message says that is returned for users who have opted out of the survey.
   */
  optOutMessage: string;
  /**
   * What the message says that is returned for users who have completed the survey.
   */
  completedMessage: string;
  /**
   * The text that will be shown for a question. Supports markdown.
   */
  questions: string[];
  options: SurveyOption[];
};

export type SurveyOption = {
  /**
   * The text that will be shown for an option. Supports plain text only.
   */
  text: string;
  /**
   * The value as it will be transferred and persisted.
   */
  value: string;
};

/**
 * User configuration input. Will be merged with the base configuration for non-overlapping values.
 */
export type DevExSurveyConfigurationInput = Partial<DevExSurveyConfiguration>;

/**
 * @description Represents a survey response.
 */
export type SurveyResponse = {
  team: string;
  choices: string[];
  timestamp: number;
};

type TextOptions = 'plain_text' | 'mrkdwn';

type Style = 'primary' | 'danger';

export type SentimentOptions = {
  type: 'static_select';
  action_id: string;
  placeholder: {
    type: 'plain_text';
    text: string;
  };
  options: SentimentOption[];
};

export type SentimentOption = {
  value: string;
  text: {
    type: 'plain_text';
    text: string;
  };
};

export type SurveyOperationResult = 'opened' | 'closed' | 'failed';

export type SectionHeader = {
  type: 'header';
  text: {
    type: 'plain_text';
    text: string;
    emoji: boolean;
  };
};

export type SectionQuestion = {
  type: 'section';
  text: {
    type: TextOptions;
    text: string;
  };
  accessory: SentimentOptions;
};

export type SectionFinish = {
  type: 'section';
  text: {
    type: TextOptions;
    text: string;
  };
  accessory: {
    type: 'button';
    text: {
      type: 'plain_text';
      text: string;
    };
    style: Style;
    value: string;
    action_id: string;
  };
};

export type Blocks = (SectionHeader | SectionQuestion | SectionFinish)[];

export type OpenSurveyMessage = {
  channel: string;
  blocks: Blocks;
};

export type CloseSurveyMessage = {
  replace_original: boolean;
  text: string;
};

export type OptInOutResponse = {
  response_type: 'ephemeral';
  blocks: [
    {
      type: 'header';
      text: {
        type: 'plain_text';
        text: string;
        emoji: true;
      };
    }
  ];
};

/**
 * @description The shape of Slack's webhook payloads.
 * @todo
 */
export type SlackWebhookPayload = {
  type: 'block_actions';
  user: User;
  api_app_id: string;
  token: string;
  container: Container;
  trigger_id: string;
  team: Team;
  enterprise: null | boolean;
  is_enterprise_install: boolean;
  channel: Channel;
  message: {
    type: 'message';
    subtype: 'bot_message';
    text: string;
    ts: string;
    bot_id: string;
    blocks: Blocks;
  };
  state: {
    values: ChoiceValue;
  };
  response_url: string;
  actions: Action[];
};

type ChoiceValue = {
  [random: string]: {
    dayChoice: {
      type: 'radio_buttons';
      selected_option: {
        text: { type: 'mrkdwn'; text: string; verbatim: boolean };
        value: string;
      };
    };
  };
};

type User = { id: string; username: string; name: string; team_id: string };

type Container = {
  type: 'message';
  message_ts: string;
  channel_id: string;
  is_ephemeral: false;
};

type Team = { id: string; domain: string };

type Channel = { id: string; name: string };

type Action = {
  action_id: 'button';
  block_id: string;
  text: { type: 'plain_text'; text: 'Save'; emoji: true };
  value: string;
  style: 'primary';
  type: 'button';
  action_ts: string;
};
