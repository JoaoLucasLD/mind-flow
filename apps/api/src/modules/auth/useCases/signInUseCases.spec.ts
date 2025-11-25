import { SignInUseCase } from './signInUseCases'; 
import { JwtService } from '@nestjs/jwt';
import { UserPayload } from '../models/UserPayload';

let signInUseCase: SignInUseCase;
let jwtService: JwtService;

describe('Sign in', () => {
  beforeEach(() => {
    jwtService = new JwtService({ secret: 'secret' });
    signInUseCase = new SignInUseCase(jwtService);
  });

  it('Should be able to create valid access_token', async () => {
    // Mock de um usuário válido
    const user = {
      id: '123',
      name: 'Test User',
      email: 'test@example.com',
      password: 'hashedpassword',
      role: 'PSICOLOGO',
      account_status: 'ACTIVE',
    };

    const token = await signInUseCase.execute({
      user: user as any,
    });

    const payload = jwtService.decode(token) as UserPayload;

    expect(payload.sub).toEqual(user.id);
  });
});