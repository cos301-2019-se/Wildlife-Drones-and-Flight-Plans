import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { CacheModule} from '@nestjs/common';
export const imports = [
  PassportModule.register({ defaultStrategy: 'jwt' }),
  JwtModule.register({
    secretOrPrivateKey: 'secretKey',
    signOptions: {
      expiresIn: 3600,
    },
  }),
  
CacheModule.register({
  ttl: 600, // seconds
  max: 10, // maximum number of items in cache
})
];