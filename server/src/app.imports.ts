import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { CacheModule } from '@nestjs/common';
export const imports = [
  PassportModule.register({ defaultStrategy: 'jwt' }),
  JwtModule.register({
    secret: process.env.SECRET,
    signOptions: {
      expiresIn: process.env.TOKEN_EXPIRES,
    },
  }),

  CacheModule.register({
    ttl: 600, // seconds
    max: 10, // maximum number of items in cache
  })
];
