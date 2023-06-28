import { DevExSurveyConfiguration } from '../interfaces/DevExSurvey';

/**
 * @description Base configuration that is used unless user provides overrides.
 */
export const baseConfiguration: DevExSurveyConfiguration = {
  heading: 'Developer Experience survey',
  optionsPlaceholder: 'I feel...',
  finishHeading: '*Finish*',
  finishButtonText: 'Finish the survey :tada:',
  optInMessage: 'You are now opted-in to the developer experience survey!',
  optOutMessage: 'You are now opted-out from the developer experience survey.',
  completedMessage: 'Thanks for taking the time to share with us!',
  questions: [
    '*1. How has your day been?*',
    '*2. Did you make progress toward your goals today?*\nConsider the clarity of goals, how engaging the work is, your control of the structure of work...',
    '*3. Have you been able to focus today?*\nConsider the number of meetings, interruptions, unplanned work...',
    '*4. Is your tooling working well and fast?*\nConsider CI, code tools, platform tools, build and test times, code review times...',
    '*5. Is the cognitive load manageable?*\nConsider project complexity, friction, processes, communication...'
  ],
  options: [
    {
      text: 'Positive',
      value: 'positive'
    },
    {
      text: 'Neutral',
      value: 'neutral'
    },
    {
      text: 'Negative',
      value: 'negative'
    }
  ]
};
