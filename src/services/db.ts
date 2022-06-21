import { PrismaClient } from '@prisma/client';
import { Logger } from '.';
import 'dotenv/config';
import { LogEvent, QueryEvent } from '../models/prisma-events';
const Config = require('../../config/config.json');
const LogMessages = require('../../logs/logs.json');

//prevent hot reloading from creating instances of the prisma client
//for that we declare prisma globally as globals are not reset by hot reload

declare global {
  namespace NodeJS {
    interface Global {
      Db: PrismaClient;
    }
  }
}

const db = Config.db;
const url = `${db.engine}://${db.user}:${db.password}@${db.host}:${db.port}/${db.database}?schema=${db.schema}`;
const Db =
  global.Db ||
  new PrismaClient({
    datasources: {
      db: {
        url,
      },
    },
    //we emit events for all log messages so we can use pino to catch them and have a streamlined logger.
    log: [
      {
        emit: 'event',
        level: 'query',
      },
      {
        emit: 'event',
        level: 'error',
      },
      {
        emit: 'event',
        level: 'info',
      },
      {
        emit: 'event',
        level: 'warn',
      },
    ],
  });

if (Config.env === 'development') {
  global.Db = Db;
}

Db.$on('query', (e: QueryEvent) => {
  Logger.info(LogMessages.info.prismaQuery.replaceAll('{QUERY}', e.query));
});

Db.$on('error', (e: LogEvent) => {
  Logger.info(LogMessages.error.prismaError.replaceAll('{TEXT}', e.message));
});

Db.$on('warn', (e: LogEvent) => {
  Logger.info(LogMessages.warn.prisma.replaceAll('{TEXT}', e.message));
});

Db.$on('info', (e: LogEvent) => {
  Logger.info(LogMessages.info.prismaInfo.replaceAll('{TEXT}', e.message));
});

export { Db };
