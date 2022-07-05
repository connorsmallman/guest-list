import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GuestsController } from './Infrastructure/http/GuestsController';
import { AddGuest } from './UseCases/AddGuest';
import { GuestListRepository } from './Repositories/GuestListRepository';
import { CreateHousehold } from './UseCases/CreateHousehold';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT),
      username: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      entities: [],
      synchronize: false,
      autoLoadEntities: true,
      logging: ['query'],
    }),
  ],
  controllers: [GuestsController],
  providers: [AddGuest, CreateHousehold, GuestListRepository],
})
export class App {}
