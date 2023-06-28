import {
  Blocks,
  CloseSurveyMessage,
  DevExSurveyConfiguration,
  DevExSurveyConfigurationInput,
  DevExSurveyOptions,
  OpenSurveyMessage,
  SectionFinish,
  SectionHeader,
  SectionQuestion,
  SentimentOption,
  SentimentOptions,
  SurveyOperationResult,
  SurveyOption,
  SurveyResponse
} from '../interfaces/DevExSurvey';
import { SlackWebhookPayload } from '../interfaces/DevExSurvey';

import { FetchError } from '../errors/FetchError';
import { InvalidConfigurationError } from '../errors/InvalidConfigurationError';
import { InvalidPayloadError } from '../errors/InvalidPayloadError';
import { MissingRequiredParametersError } from '../errors/MissingRequiredParametersError';

import { baseConfiguration } from '../config/baseConfiguration';
import { MissingRequiredOptionsParametersError } from '../errors/MissingRequiredOptionsParametersError';

/**
 * @description Get a new instance of the `DevExSurvey`.
 */
export function createNewDevExSurvey(options: DevExSurveyOptions) {
  return new DevExSurvey(options);
}

/**
 * @description The `DevExSurvey` makes it easy to run developer
 * experience surveys in Slack.
 *
 * It requires a Slack `authToken`.
 */
class DevExSurvey {
  private readonly authToken: string;
  readonly config: DevExSurveyConfiguration;

  constructor(options: DevExSurveyOptions) {
    const authToken = options?.authToken;
    const config = this.createConfiguration(options?.config);
    if (!authToken) throw new MissingRequiredParametersError();

    this.authToken = authToken;
    this.config = config;
  }

  /**
   * @description Calls Slack to open up a survey to all provided user IDs.
   */
  public async open(users: string[]): Promise<SurveyOperationResult> {
    Promise.all(
      users.map(async (user: string) => {
        return await this.request(
          'https://slack.com/api/chat.postMessage',
          this.produceOpenSurveyMessage(user),
          this.authToken
        );
      })
    );

    return 'opened';
  }

  /**
   * @description Checks if the payload allows for closing the survey, in which case
   * it will call Slack with the payload's `response_url` to do so. Else it will
   * ignore (fail) the closing.
   */
  public async close(payload: SlackWebhookPayload): Promise<SurveyOperationResult> {
    this.validatePayload(payload);

    if (this.isClosable(payload)) {
      await this.request(payload?.response_url, this.produceCloseSurveyMessage());
      return 'closed';
    }

    return 'failed';
  }

  /**
   * @description Generates a valid, well-formed `SurveyResponse` object
   * which can be used outside of the `DevExSurvey` such as for recording
   * or informing other systems about what happened in this specific response.
   */
  public createSurveyResponse(payload: SlackWebhookPayload): SurveyResponse {
    this.validatePayload(payload);

    return {
      team: payload.team.domain,
      choices: this.getChoiceValues(payload.state.values),
      timestamp: Date.now()
    };
  }

  /**
   * @description Generates a well-shaped opt-in response that can be sent to Slack.
   */
  public createOptInResponse() {
    return this.createOptInOutBase(this.config.optInMessage);
  }

  /**
   * @description Generates a well-shaped opt-out response that can be sent to Slack.
   */
  public createOptOutResponse() {
    return this.createOptInOutBase(this.config.optOutMessage);
  }

  /////////////////////
  // PRIVATE METHODS //
  /////////////////////

  /**
   * @description Validates the incoming Slack payload.
   */
  private createConfiguration(config?: DevExSurveyConfigurationInput): DevExSurveyConfiguration {
    const configuration = config ? Object.assign(baseConfiguration, config) : baseConfiguration;
    this.validateConfiguration(configuration);
    return configuration;
  }

  /**
   * @description Validates the combined configuration (base and user input).
   */
  private validateConfiguration(config: DevExSurveyConfiguration): void {
    if (
      !config ||
      !config.heading ||
      !config.optionsPlaceholder ||
      !config.finishHeading ||
      !config.finishButtonText ||
      !config.optInMessage ||
      !config.optOutMessage ||
      !config.completedMessage ||
      config.options.length === 0 ||
      config.questions.length === 0
    )
      throw new InvalidConfigurationError();

    config.options.forEach((option: SurveyOption) => {
      const value = option.value;
      const text = option.value;
      if (!value || !text) throw new MissingRequiredOptionsParametersError();
    });
  }

  /**
   * @description Validates the incoming Slack payload.
   */
  private validatePayload(payload: SlackWebhookPayload): void {
    if (
      !payload ||
      !payload.actions ||
      payload.actions.length === 0 ||
      !payload.user.name ||
      !payload.team.domain ||
      !payload.state.values
    )
      throw new InvalidPayloadError();
  }

  /**
   * @description Generates the skeleton for opt in/out responses.
   */
  private createOptInOutBase(text: string) {
    return {
      response_type: 'ephemeral',
      blocks: [
        {
          type: 'header',
          text: {
            type: 'plain_text',
            text,
            emoji: true
          }
        }
      ]
    };
  }

  /**
   * @description Gets the response's choice values from the Slack payload.
   */
  private getChoiceValues(choiceValues: Record<string, any>) {
    return Object.values(choiceValues)
      .map((item: Record<string, any>) => Object.values(item)[0].selected_option?.value)
      .filter((value: string | null) => value);
  }

  /**
   * @description Checks if a survey is fully answered and possible to close,
   * and if the "finalize" button was pushed.
   */
  private isClosable(payload: SlackWebhookPayload): boolean {
    const choices = this.getChoiceValues(payload.state.values);

    return payload.response_url &&
      choices.length === this.config.questions.length &&
      payload.actions[0]?.value === 'finalize'
      ? true
      : false;
  }

  /**
   * @description Generates a message that can be sent to Slack, when closing the survey.
   */
  private produceCloseSurveyMessage(): CloseSurveyMessage {
    return {
      replace_original: true,
      text: this.config.completedMessage
    };
  }

  /**
   * @description Creates a message that can be sent to Slack when opening the survey.
   */
  private produceOpenSurveyMessage(channelId: string): OpenSurveyMessage {
    const header = this.produceHeaderSection();
    const questions = this.produceQuestionsSection();
    const finish = this.produceFinishingSection();

    const blocks: Blocks = [];
    blocks.push(header);
    blocks.push(...questions);
    blocks.push(finish);

    return {
      channel: channelId,
      blocks
    };
  }

  /**
   * @description Creates the skeleton for the initial header section.
   */
  private produceHeaderSection(): SectionHeader {
    return {
      type: 'header',
      text: {
        type: 'plain_text',
        text: this.config.heading,
        emoji: true
      }
    };
  }

  /**
   * @description Creates the skeleton for the question sections.
   */
  private produceQuestionsSection(): SectionQuestion[] {
    return this.config.questions.map((question: string, index: number) => {
      return {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: question
        },
        accessory: this.produceSentimentOptions(`Choice-${index}`)
      };
    });
  }

  /**
   * @description Creates the skeleton for the last section.
   */
  private produceFinishingSection(): SectionFinish {
    return {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: this.config.finishHeading
      },
      accessory: {
        type: 'button',
        text: {
          type: 'plain_text',
          text: this.config.finishButtonText
        },
        style: 'primary',
        value: 'finalize',
        action_id: 'button'
      }
    };
  }

  /**
   * @description Creates the skeleton of options for sentiment/opinion on choices.
   */
  private produceSentimentOptions(actionId: string): SentimentOptions {
    return {
      type: 'static_select',
      action_id: actionId,
      placeholder: {
        type: 'plain_text',
        text: this.config.optionsPlaceholder
      },
      options: this.getSentimentOptions()
    };
  }

  /**
   * @description Ve
   */
  private getSentimentOptions(): SentimentOption[] {
    return this.config.options.map((option: SurveyOption) => {
      return {
        value: option.value,
        text: {
          type: 'plain_text',
          text: option.text
        }
      };
    });
  }

  /**
   * @description HTTPS request helper function.
   */
  private async request(url: string, data: Record<string, any>, authorizationToken?: string) {
    if (!data) return;

    const options: Record<string, any> = {
      method: 'POST',
      body: JSON.stringify(data),
      headers: {
        'Content-type': 'application/json'
      }
    };

    if (authorizationToken) options.headers['Authorization'] = `Bearer ${authorizationToken}`;

    if (process.env.NODE_ENV !== 'test')
      return await fetch(url, options)
        .then((res: any) => {
          if (res.status >= 200 && res.status < 300) return res.text();
          throw new FetchError(`Error: "${res.statusText}\nStatus code: "${res.status}"`);
        })
        .catch((error: any) => error);
  }
}
