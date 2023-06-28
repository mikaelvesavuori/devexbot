import { MikroLog } from 'mikrolog';

/**
 * @description Used when parameters are missing from an options object.
 */
export class MissingRequiredOptionsParametersError extends Error {
  constructor() {
    super();
    this.name = 'MissingRequiredOptionsParametersError';
    const message = `Missing required parameters "text" and/or "value"!`;
    this.message = message;

    const logger = MikroLog.start();
    logger.error(message);
  }
}
