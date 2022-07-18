/* eslint-disable @typescript-eslint/no-explicit-any */ //needed because we eventually pass errors to the logger which assume any type
import { DiscordAPIError } from 'discord.js';
import { Response } from 'node-fetch';
import pino from 'pino';

const logger = pino({
  formatters: {
    level: (label) => {
      //by default pino uses numbers as log level, but labels are more readable
      return { level: label };
    },
  },
  transport: {
    target: 'pino-pretty',
    options: {
      colorize: true,
      ignore: 'pid, hostname',
      translateTime: 'yyyy-mm-dd HH:MM:ss.l',
    },
  },
});

export class Logger {
  public static info(msg: string, obj?: any): void {
    if (!obj) {
      logger.info(msg);
      return;
    }
    //in case we want to monitor an object, we can just put it into the log as well
    logger.info(msg, obj);
  }

  public static warn(msg: string, obj?: any): void {
    if (!obj) {
      logger.warn(msg, obj);
      return;
    }
    logger.warn(msg);
  }

  public static async error(msg: string, obj?: any): Promise<void> {
    if (!obj) {
      //only log message if there is no error object
      logger.error(msg);
      return;
    }

    if (typeof obj === 'string') {
      logger
        .child({
          msg: obj,
        })
        .error(msg);
    } else if (obj instanceof Response) {
      //try to get the response as text and then log all available information
      let resText: string;
      try {
        resText = await obj.text();
      } catch {
        //Ignore
      }
      logger
        .child({
          path: obj.url,
          status: obj.status,
          statusName: obj.statusText,
          headers: obj.headers.raw(),
          body: resText,
        })
        .error(msg);
    } else if (obj instanceof DiscordAPIError) {
      logger
        .child({
          message: obj.message,
          code: obj.code,
          statusCode: obj.status,
          method: obj.method,
          path: obj.url,
          stack: obj.stack,
        })
        .error(obj, msg);
    } else {
      logger.error(obj, msg);
    }
  }
}
