import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { UserModule } from './modules/user/user.module';
import { AuthModule } from './modules/auth/auth.module';
import { PostModule } from './modules/post/post.module';
import { CategoryModule } from './modules/category/category.module';
import { TagModule } from './modules/tag/tag.module';
import { ImageModule } from './modules/image/image.module';
import { CommentModule } from './modules/comment/comment.module';
import { SiteConfigModule } from './modules/config/config.module';
import { User } from './modules/user/entities/user.entity';
import { Post } from './modules/post/entities/post.entity';
import { Category } from './modules/category/entities/category.entity';
import { Tag } from './modules/tag/entities/tag.entity';
import { Image } from './modules/image/entities/image.entity';
import { Comment } from './modules/comment/entities/comment.entity';
import { Config } from './modules/config/entities/config.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      // dev 加载 .env.development，prod 加载 .env.production，其他加载 .env
      envFilePath:
        process.env.NODE_ENV === 'development'
          ? '.env.development'
          : process.env.NODE_ENV === 'production'
            ? '.env.production'
            : '.env',
      isGlobal: true,
    }),
    // 静态文件服务，用于图片访问
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'uploads'),
      serveRoot: '/uploads',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'mysql',
        host: 'localhost',
        port: 3306,
        username: configService.get('DB_USERNAME'),
        password: configService.get('DB_PASSWORD'),
        database: configService.get('DB_NAME'),
        entities: [User, Post, Category, Tag, Image, Comment, Config],
        synchronize: true,
      }),
      inject: [ConfigService],
    }),
    UserModule,
    AuthModule,
    PostModule,
    CategoryModule,
    TagModule,
    ImageModule,
    CommentModule,
    SiteConfigModule,
  ],
})
export class AppModule {}
