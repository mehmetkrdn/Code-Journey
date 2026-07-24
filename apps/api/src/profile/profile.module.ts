import { Module } from '@nestjs/common';

import { UsersModule } from '../users/users.module';
import { ProfileController } from './profile.controller';
import { ProfileService } from './profile.service';
import { JwtModule } from '@nestjs/jwt'; //jwt modülü, jwt token oluşturmak ve doğrulamak için kullanılır. Bu modül, uygulamanın güvenliğini sağlamak için önemlidir. 
//// AccessTokenGuard'ın ihtiyaç duyduğu JwtService bağımlılığını sağlamak için eklendi.

@Module({
  imports: [UsersModule,JwtModule], //sayesinde ProfileService, UsersService sınıfını kullanabilecek.
  controllers: [ProfileController],
  providers: [ProfileService],
})
export class ProfileModule {}