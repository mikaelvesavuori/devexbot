import test from 'ava';

import { createNewDevExSurvey } from '../../src/domain/DevExSurvey';

import { baseConfiguration } from '../../src/config/baseConfiguration';

import ReceiveWebhookEvent from '../../testdata/ReceiveWebhook.event.json';

const options = { authToken: 'something' };

test('It should open a survey', async (t) => {
  const expected = 'opened';
  const users: any[] = ['sam_person'];
  const devex = createNewDevExSurvey(options);

  const result = await devex.open(users);

  t.is(result, expected);
});

test('It should close a survey', async (t) => {
  const expected = 'closed';
  const input = JSON.parse(JSON.stringify(ReceiveWebhookEvent));
  const devex = createNewDevExSurvey(options);

  const result = await devex.close(input);

  t.is(result, expected);
});

test('It should create a response for users opting in', (t) => {
  const expected = {
    blocks: [
      {
        text: {
          emoji: true,
          text: 'You are now opted-in to the developer experience survey!',
          type: 'plain_text'
        },
        type: 'header'
      }
    ],
    response_type: 'ephemeral'
  };

  const devex = createNewDevExSurvey(options);

  const result = devex.createOptInResponse();

  t.deepEqual(result, expected);
});

test('It should create a response for users opting out', (t) => {
  const expected = {
    blocks: [
      {
        text: {
          emoji: true,
          text: 'You are now opted-out from the developer experience survey.',
          type: 'plain_text'
        },
        type: 'header'
      }
    ],
    response_type: 'ephemeral'
  };

  const devex = createNewDevExSurvey(options);

  const result = devex.createOptOutResponse();

  t.deepEqual(result, expected);
});

test('It should create a response for completed surveys', (t) => {
  const expected = {
    choices: ['positive', 'negative', 'positive', 'neutral', 'positive'],
    team: 'some-domain'
    //timestamp: 1687799984244
  };

  const input = JSON.parse(JSON.stringify(ReceiveWebhookEvent));
  const devex = createNewDevExSurvey(options);

  const result = devex.createSurveyResponse(input);

  // Given timestamps change all the time, we'll just ensure that it seems we are getting one before dropping it for a comparison of static properties
  t.is(typeof result?.timestamp, 'number');
  t.is(result?.timestamp.toString().length, 13);
  // @ts-ignore
  delete result['timestamp'];
  t.deepEqual(result, expected);
});

test('It should set the default custom configuration', (t) => {
  const expected = baseConfiguration;

  const result = createNewDevExSurvey({ authToken: options.authToken }).config;

  t.deepEqual(result, expected);
});

test('It should use a partial custom configuration', (t) => {
  const expected = {
    completedMessage: '<3',
    finishButtonText: 'Finish the survey :tada:',
    finishHeading: '*Finish*',
    heading: 'My survey',
    optInMessage: 'You are now opted-in to the developer experience survey!',
    optOutMessage: 'You are now opted-out from the developer experience survey.',
    options: [
      {
        text: 'Super',
        value: 'super'
      },
      {
        text: 'OK',
        value: 'ok'
      },
      {
        text: 'Nope',
        value: 'nope'
      }
    ],
    optionsPlaceholder: 'I feel...',
    questions: [
      '*1. How has your day been?*',
      '*2. Did you make progress toward your goals today?*\nConsider the clarity of goals, how engaging the work is, your control of the structure of work...',
      '*3. Have you been able to focus today?*\nConsider the number of meetings, interruptions, unplanned work...',
      '*4. Is your tooling working well and fast?*\nConsider CI, code tools, platform tools, build and test times, code review times...',
      '*5. Is the cognitive load manageable?*\nConsider project complexity, friction, processes, communication...'
    ]
  };

  const input = {
    heading: 'My survey',
    completedMessage: '<3',
    options: [
      {
        text: 'Super',
        value: 'super'
      },
      {
        text: 'OK',
        value: 'ok'
      },
      {
        text: 'Nope',
        value: 'nope'
      }
    ]
  };

  const result = createNewDevExSurvey({ authToken: options.authToken, config: input }).config;

  t.deepEqual(result, expected);
});

test('It should use a full, custom configuration', (t) => {
  const input = {
    heading: 'My survey',
    optionsPlaceholder: 'I think...',
    finishHeading: '*Submit*',
    finishButtonText: 'Submit my opinions',
    optInMessage: 'Opted in!',
    optOutMessage: 'Opted out!',
    completedMessage: '<3',
    questions: [`*1. Question 1?*`, `*2. Question 2?*`, `*3. Question 3?*`],
    options: [
      {
        text: 'Super',
        value: 'super'
      },
      {
        text: 'OK',
        value: 'ok'
      },
      {
        text: 'Nope',
        value: 'nope'
      }
    ]
  };

  const result = createNewDevExSurvey({ authToken: options.authToken, config: input }).config;

  t.deepEqual(result, input);
});

/**
 * NEGATIVE TESTS
 */

test('It should throw a InvalidPayloadError', (t) => {
  const expected = 'InvalidPayloadError';

  const error: any = t.throws(() =>
    createNewDevExSurvey(options).createSurveyResponse({ asdf: 123 } as any)
  );

  t.is(error.name, expected);
});

test('It should throw a MissingRequiredParametersError', (t) => {
  const expected = 'MissingRequiredParametersError';

  // @ts-ignore
  const error: any = t.throws(() => createNewDevExSurvey());

  t.is(error.name, expected);
});

test('It should throw a InvalidConfigurationError if questions are zero', (t) => {
  const expected = 'InvalidConfigurationError';

  // @ts-ignore
  const error: any = t.throws(() =>
    createNewDevExSurvey({ authToken: options.authToken, config: { questions: [] } })
  );

  t.is(error.name, expected);
});

test('It should throw a InvalidConfigurationError if options are zero', (t) => {
  const expected = 'InvalidConfigurationError';

  // @ts-ignore
  const error: any = t.throws(() =>
    createNewDevExSurvey({ authToken: options.authToken, config: { options: [] } })
  );

  t.is(error.name, expected);
});

test('It should throw a MissingRequiredOptionsParametersError if options are malformed', (t) => {
  const expected = 'MissingRequiredOptionsParametersError';

  // @ts-ignore
  const error: any = t.throws(() =>
    createNewDevExSurvey({
      authToken: options.authToken,
      // @ts-ignore
      config: { options: [{ abc: 123 }], questions: ['abc'] }
    })
  );

  t.is(error.name, expected);
});
