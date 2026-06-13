import {Module} from '@nestjs/common'
import {ConfigModule} from '@nestjs/config'
import {AuthModule} from './auth/auth.module'
import {GroupsModule} from './groups/groups.module'
import {HealthController} from './health/health.controller'
import {MessagesModule} from './messages/messages.module'
import {PrismaModule} from './prisma/prisma.module'

@Module({
  imports: [
    ConfigModule.forRoot({isGlobal: true}),
    PrismaModule,
    AuthModule,
    GroupsModule,
    MessagesModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
