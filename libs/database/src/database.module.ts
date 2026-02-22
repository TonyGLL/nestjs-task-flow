import { Module, Global } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Global() // Hacemos global para no importarlo en cada sub-módulo de las apps
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class DatabaseModule {}
