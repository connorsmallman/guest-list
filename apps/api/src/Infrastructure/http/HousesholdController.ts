import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  Post,
  Put,
  Res,
} from '@nestjs/common';
import { either as E } from 'fp-ts';
import { Response } from 'express';

import { CreateHousehold } from '../../UseCases/CreateHousehold';
import { FailedToCreateHousehold } from '../../Domain/problems/FailedToCreateHousehold';
import { Household } from '../../Domain/Household';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';
import { Household as HouseholdEntity } from '../db/entities/Household';
import { Guest as GuestEntity } from '../db/entities/Guest';
import { RSVP } from '../../UseCases/RSVP';
import { AddGuestToHousehold } from '../../UseCases/AddGuestToHousehold';
import { FailedToAddGuestToHousehold } from '../../Domain/problems/FailedToAddGuestToHousehold';
import { HouseholdNotFound } from '../../Domain/problems/HouseholdNotFound';
import { GuestNotFound } from '../../Domain/problems/GuestNotFound';
import { FailToRSVP } from '../../Domain/problems/FailToRSVP';
import { GuestsNotFoundInHousehold } from '../../Domain/problems/GuestsNotFoundInHousehold';

type GuestDTO = {
  id: string;
  name: string;
  email?: string;
  dietaryRequirements: null | string;
  attending: null | boolean;
  isChild: boolean;
  household: null | number;
};

type HouseholdResponseDTO = {
  id: number;
  code: string;
  guests: GuestDTO[];
};

type HouseholdsResponseDTO = HouseholdResponseDTO[];

type CreateHouseholdResponseDTO = {
  id: number;
  code: string;
};

type AddGuestToHouseholdRequestDTO = {
  householdId: number;
  guestId: string;
};

type RVSPToHouseholdRequestDTO = {
  householdCode: string;
  guests: GuestDTO[];
};

@Controller('households')
export class GuestsController {
  constructor(
    readonly createHouseholdUseCase: CreateHousehold,
    readonly rsvpToHouseholdUseCase: RSVP,
    readonly addGuestToHouseholdUseCase: AddGuestToHousehold,
    @InjectEntityManager() readonly entityManager: EntityManager,
  ) {}
  @Get()
  async findAll(): Promise<HouseholdsResponseDTO[]> {
    return this.entityManager
      .createQueryBuilder(HouseholdEntity, 'household')
      .leftJoinAndSelect('household.guest', 'guest')
      .getRawOne();
  }

  @Get(':id')
  async find(@Param() id: string): Promise<Household> {
    return this.entityManager
      .createQueryBuilder(GuestEntity, 'guest')
      .where('guest.id = :id', { id })
      .getRawOne();
  }

  @Post()
  async createHousehold(
    @Res() res: Response,
  ): Promise<CreateHouseholdResponseDTO> {
    const response = await this.createHouseholdUseCase.execute()();

    if (E.isLeft(response)) {
      if (response.left instanceof FailedToCreateHousehold) {
        res.status(HttpStatus.BAD_REQUEST);
      } else {
        res.status(HttpStatus.INTERNAL_SERVER_ERROR);
      }
      res.json(response.left);
    } else {
      res.json(response.right);
      return response.right;
    }
  }

  @Put('/:id/guests')
  async addGuestToHousehold(
    @Res() res: Response,
    @Body() body: AddGuestToHouseholdRequestDTO,
  ): Promise<Household> {
    const command = {
      householdId: body.householdId,
      guestId: body.guestId,
    };

    const response = await this.addGuestToHouseholdUseCase.execute(command)();

    if (E.isLeft(response)) {
      if (response.left instanceof FailedToAddGuestToHousehold) {
        res.status(HttpStatus.BAD_REQUEST);
      } else if (response.left instanceof HouseholdNotFound) {
        res.status(HttpStatus.NOT_FOUND);
      } else if (response.left instanceof GuestNotFound) {
        res.status(HttpStatus.NOT_FOUND);
      } else {
        res.status(HttpStatus.INTERNAL_SERVER_ERROR);
      }
      res.json(response.left);
    } else {
      res.json(response.right);
      return response.right;
    }
  }

  @Put('/rsvp')
  async rsvpToHousehold(
    @Res() res: Response,
    @Body() body: RVSPToHouseholdRequestDTO,
  ): Promise<Household> {
    const command = {
      householdCode: body.householdCode,
      guests: body.guests,
    };

    const response = await this.rsvpToHouseholdUseCase.execute(command)();

    if (E.isLeft(response)) {
      if (response.left instanceof FailToRSVP) {
        res.status(HttpStatus.BAD_REQUEST);
      } else if (response.left instanceof HouseholdNotFound) {
        res.status(HttpStatus.NOT_FOUND);
      } else if (response.left instanceof GuestsNotFoundInHousehold) {
        res.status(HttpStatus.NOT_FOUND);
      } else {
        res.status(HttpStatus.INTERNAL_SERVER_ERROR);
      }
      res.json(response.left);
    } else {
      res.json(response.right);
      return response.right;
    }
  }
}
