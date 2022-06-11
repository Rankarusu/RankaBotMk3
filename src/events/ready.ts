import { Event } from '../models/Event';
export default new Event('ready', () => {
  console.log('Bot is online!');
});
