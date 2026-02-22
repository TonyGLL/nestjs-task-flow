import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
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
  /**
   * Connect to the database when the module is initialized.
   */
  async onModuleInit() {
    await this.$connect();
  }

  /**
   * Disconnect from the database when the module is destroyed (e.g., app shutdown).
   */
  async onModuleDestroy() {
    await this.$disconnect();
  }
}
