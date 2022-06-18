import { PrismaClient } from '@prisma/client';
import { Logger } from '.';
import 'dotenv/config';
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
    log: ['query', 'info', 'warn', 'error'], //logs to stdout by default
    //TODO: event based logging so we can let pino handle it.
  });

if (Config.env === 'development') {
  global.Db = Db;
}

// TODO: find out why this does not work
// Db.$on('beforeExit', async () => {
//   Logger.info(LogMessages.info.databaseBeforeExit);
//   await Db.$disconnect();
// });

export { Db };
