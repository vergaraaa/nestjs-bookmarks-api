import { Test } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { PrismaService } from '../src/prisma/prisma.service';
import * as pactum from 'pactum';
import { AuthDto } from 'src/auth/dto/auth.dto';

describe('App e2e', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();

    app.setGlobalPrefix('/api');
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
      }),
    );

    await app.init();
    await app.listen(3333);

    prisma = app.get(PrismaService);
    await prisma.cleanDb();

    pactum.request.setBaseUrl('http://localhost:3333/api');
  });

  afterAll(async () => {
    app.close();
  });

  describe('Auth', () => {
    const authDto: AuthDto = {
      email: 'vergara@gmail.com',
      password: '123456',
    };

    describe('Register', () => {
      it('should throw an error if no body provided', () => {
        return pactum.spec().post('/auth/register').expectStatus(400);
      });

      it('should throw an error if email empty', () => {
        return pactum
          .spec()
          .post('/auth/register')
          .withBody({ password: authDto.password })
          .expectStatus(400);
      });

      it('should throw an error if password empty', () => {
        return pactum
          .spec()
          .post('/auth/register')
          .withBody({ email: authDto.email })
          .expectStatus(400);
      });

      it('should signup', () => {
        return pactum
          .spec()
          .post('/auth/register')
          .withBody(authDto)
          .expectStatus(201);
      });
    });

    describe('Login', () => {
      it('should throw an error if no body provided', () => {
        return pactum.spec().post('/auth/login').expectStatus(400);
      });

      it('should throw an error if email empty', () => {
        return pactum
          .spec()
          .post('/auth/login')
          .withBody({ password: authDto.password })
          .expectStatus(400);
      });

      it('should throw an error if password empty', () => {
        return pactum
          .spec()
          .post('/auth/login')
          .withBody({ email: authDto.email })
          .expectStatus(400);
      });

      it('should login', () => {
        return pactum
          .spec()
          .post('/auth/login')
          .withBody(authDto)
          .expectStatus(200)
          .stores('userAccessToken', 'access_token');
      });
    });
  });

  describe('User', () => {
    describe('Get me', () => {
      it('should throw an error if no token provided', () => {
        return pactum.spec().get('/users/me').expectStatus(401);
      });

      it('should get current user', () => {
        return pactum
          .spec()
          .get('/users/me')
          .withHeaders({
            Authorization: 'Bearer $S{userAccessToken}',
          })
          .expectStatus(200);
      });
    });

    describe('Edit User', () => {});
  });

  describe('Bookmarks', () => {
    describe('Get bookmarks', () => {});

    describe('Get bookmark by id', () => {});

    describe('Create bookmark', () => {});

    describe('Edit bookmark by id', () => {});

    describe('Delete bookmark by id', () => {});
  });
});
