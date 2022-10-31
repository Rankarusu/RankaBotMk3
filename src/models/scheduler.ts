import { ScheduledTask } from 'node-cron';

export abstract class Scheduler {
  protected job: ScheduledTask;

  public abstract start(): void | Promise<void>;

  public stop(): void | Promise<void> {
    this.job.stop();
  }
}
