import { Test } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { PrismaService } from '../src/prisma/prisma.service';
import * as pactum from 'pactum';
import { AuthDto } from 'src/auth/dto/auth.dto';
import { EditUserDto } from 'src/users/dto/edit-user.dto';
import { CreateBookmarkDto } from 'src/bookmark/dto/create-bookmark.dto';
import { EditBookmarkDto } from 'src/bookmark/dto/edit-bookmark.dto';

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

    describe('Edit User', () => {
      it('should edit user', () => {
        const editUserDto: EditUserDto = {
          email: 'montiel@gmail.com',
          firstName: 'Montiel',
        };

        return pactum
          .spec()
          .patch('/users')
          .withHeaders({
            Authorization: 'Bearer $S{userAccessToken}',
          })
          .withBody(editUserDto)
          .expectStatus(200)
          .expectBodyContains(editUserDto.email)
          .expectBodyContains(editUserDto.firstName);
      });
    });
  });

  describe('Bookmarks', () => {
    describe('Get empty bookmarks', () => {
      it('should get bookmarks', () => {
        return pactum
          .spec()
          .get('/bookmarks')
          .withHeaders({
            Authorization: 'Bearer $S{userAccessToken}',
          })
          .expectStatus(200)
          .expectBody([]);
      });
    });

    describe('Create bookmark', () => {
      const dto: CreateBookmarkDto = {
        title: 'First Bookmark',
        link: 'https://www.youtube.com/watch?v=d6WC5n9G_sM',
      };
      it('should create bookmark', () => {
        return pactum
          .spec()
          .post('/bookmarks')
          .withHeaders({
            Authorization: 'Bearer $S{userAccessToken}',
          })
          .withBody(dto)
          .expectStatus(201)
          .stores('bookmarkId', 'id');
      });
    });

    describe('Get bookmarks', () => {
      it('should get bookmarks', () => {
        return pactum
          .spec()
          .get('/bookmarks')
          .withHeaders({
            Authorization: 'Bearer $S{userAccessToken}',
          })
          .expectStatus(200)
          .expectJsonLength(1);
      });
    });

    describe('Get bookmark by id', () => {
      it('should get bookmark by id', () => {
        return pactum
          .spec()
          .get('/bookmarks/{id}')
          .withPathParams('id', '$S{bookmarkId}')
          .withHeaders({
            Authorization: 'Bearer $S{userAccessToken}',
          })
          .expectStatus(200)
          .expectBodyContains('$S{bookmarkId}'); //.expectJsonMatch({id: '$S{bookmarkId}'}) would have been the correct way of testing to prevent false positive matches with other numbers, user id etc.
      });
    });

    describe('Edit bookmark by id', () => {
      const dto: EditBookmarkDto = {
        title:
          'Kubernetes Course - Full Beginners Tutorial (Containerize Your Apps!)',
        description:
          'Learn how to use Kubernetes in this complete course. Kubernetes makes it possible to containerize applications and simplifies app deployment to production.',
      };
      it('should edit bookmark', () => {
        return pactum
          .spec()
          .patch('/bookmarks/{id}')
          .withPathParams('id', '$S{bookmarkId}')
          .withHeaders({
            Authorization: 'Bearer $S{userAccessToken}',
          })
          .withBody(dto)
          .expectStatus(200)
          .expectBodyContains(dto.title)
          .expectBodyContains(dto.description);
      });
    });

    describe('Delete bookmark by id', () => {
      it('should delete bookmark', () => {
        return pactum
          .spec()
          .delete('/bookmarks/{id}')
          .withPathParams('id', '$S{bookmarkId}')
          .withHeaders({
            Authorization: 'Bearer $S{userAccessToken}',
          })
          .expectStatus(204);
      });

      it('should get empty bookmarks', () => {
        return pactum
          .spec()
          .get('/bookmarks')
          .withHeaders({
            Authorization: 'Bearer $S{userAccessToken}',
          })
          .expectStatus(200)
          .expectJsonLength(0);
      });
    });
  });
});
