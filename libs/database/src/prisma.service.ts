import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Logger,
} from '@nestjs/common';
import { PrismaClient } from '@generated';

/**
 * PrismaService is a wrapper around the PrismaClient.
 * It manages the database connection lifecycle within the NestJS application.
 */
@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    super({
      log: [
        { emit: 'event', level: 'query' },
        { emit: 'stdout', level: 'info' },
        { emit: 'stdout', level: 'warn' },
        { emit: 'stdout', level: 'error' },
      ],
    });
  }

  /**
   * Connect to the database when the module is initialized.
   */
  async onModuleInit() {
    await this.$connect();

    // @ts-ignore - Prisma types for events are sometimes tricky to match exactly
    this.$on('query', (e: any) => {
      if (e.duration > 200) {
        // Log queries slower than 200ms to identify bottlenecks early
        this.logger.warn(`Slow Query: ${e.query} - Duration: ${e.duration}ms`);
      }
    });
  }

  /**
   * Disconnect from the database when the module is destroyed (e.g., app shutdown).
   */
  async onModuleDestroy() {
    await this.$disconnect();
  }
}
