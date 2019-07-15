import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

export const imports = [
  PassportModule.register({ defaultStrategy: 'jwt' }),
  JwtModule.register({
    secretOrPrivateKey: 'secretKey',
    signOptions: {
      expiresIn: 3600,
    },
  }),
];