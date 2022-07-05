import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  Post,
  Res,
} from '@nestjs/common';
import { either as E } from 'fp-ts';
import { Response } from 'express';

import { AddGuest } from '../../UseCases/AddGuest';
import { Guest as GuestEntity } from '../../Infrastructure/db/entities/Guest';
import { GuestWithThatNameAlreadyExists } from '../../Domain/problems/GuestWithThatNameAlreadyExists';
import { FailedToAddGuest } from '../../Domain/problems/FailedToAddGuest';
import { FailedToCreateGuest } from '../../Domain/problems/FailedtoCreateGuest';
import { EntityManager } from 'typeorm';
import { InjectEntityManager } from '@nestjs/typeorm';
import { GuestId } from '../../Domain/GuestId';

type GuestResponseDTO = {
  id: string;
  name: string;
  email?: string;
  dietaryRequirements: null | string;
  attending: null | boolean;
  isChild: boolean;
  household: null | number;
};

type GuestsResponseDTO = GuestResponseDTO[];

type AddGuestRequestDTO = {
  name: string;
  email?: string;
  dietaryRequirements?: string;
  attending?: boolean;
  isChild?: boolean;
};

type AddGuestResponseDTO = {
  id: string;
  name: string;
  email?: string;
  dietaryRequirements: null | string;
  attending: null | boolean;
  isChild: boolean;
  household: null | number;
};

@Controller('guests')
export class GuestsController {
  constructor(
    readonly addGuestUseCase: AddGuest,
    @InjectEntityManager() readonly entityManager: EntityManager,
  ) {}

  @Get()
  async findAll(): Promise<GuestsResponseDTO> {
    const guests = await this.entityManager
      .createQueryBuilder(GuestEntity, 'guest')
      .leftJoinAndSelect('guest.household', 'household')
      .getRawMany();

    return guests.map((guest) => ({
      id: guest.id,
      name: guest.name,
      email: guest.email,
      dietaryRequirements: guest.dietaryRequirements,
      attending: guest.attending,
      isChild: guest.isChild,
      household: guest.household.id,
    }));
  }

  @Get(':id')
  async find(@Param() id: GuestId): Promise<GuestResponseDTO> {
    return this.entityManager
      .createQueryBuilder(GuestEntity, 'guest')
      .where('guest.id = :id', { id })
      .leftJoinAndSelect('guest.household', 'household')
      .getRawOne();
  }

  @Post()
  async addGuest(
    @Res() res: Response,
    @Body() addGuestDTO: AddGuestRequestDTO,
  ): Promise<AddGuestResponseDTO> {
    const guest = {
      name: addGuestDTO.name,
      email: addGuestDTO.email,
      dietaryRequirements: addGuestDTO.dietaryRequirements,
      attending: addGuestDTO.attending,
      isChild: addGuestDTO.isChild,
    };

    const response = await this.addGuestUseCase.execute(guest)();

    if (E.isLeft(response)) {
      if (response.left instanceof GuestWithThatNameAlreadyExists) {
        res.status(HttpStatus.CONFLICT);
      } else if (response.left instanceof FailedToAddGuest) {
        res.status(HttpStatus.BAD_REQUEST);
      } else if (response.left instanceof FailedToCreateGuest) {
        res.status(HttpStatus.BAD_REQUEST);
      } else {
        res.status(HttpStatus.INTERNAL_SERVER_ERROR);
      }
      res.json(response.left);
    } else {
      res.json(response.right);
      return {
        id: response.right.id,
        name: response.right.name,
        email: response.right.email,
        dietaryRequirements: response.right.dietaryRequirements,
        attending: response.right.attending,
        isChild: response.right.isChild,
        household: response.right.household,
      };
    }
  }
}
