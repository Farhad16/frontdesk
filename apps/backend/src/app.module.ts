import {Module} from '@nestjs/common'
import {ConfigModule} from '@nestjs/config'
import {AuthModule} from './auth/auth.module'
import {EventsModule} from './events/events.module'
import {GroupsModule} from './groups/groups.module'
import {HealthController} from './health/health.controller'
import {MessagesModule} from './messages/messages.module'
import {PrismaModule} from './prisma/prisma.module'
import {UsersModule} from './users/users.module'

@Module({
  imports: [
    ConfigModule.forRoot({isGlobal: true}),
    PrismaModule,
    EventsModule,
    AuthModule,
    GroupsModule,
    MessagesModule,
    UsersModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
