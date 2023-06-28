import { MikroLog } from 'mikrolog';

/**
 * @description Used when the configuration has errors.
 */
export class InvalidConfigurationError extends Error {
  constructor() {
    super();
    this.name = 'InvalidConfigurationError';
    const message = `Configuration is invalid!`;
    this.message = message;

    const logger = MikroLog.start();
    logger.error(message);
  }
}
