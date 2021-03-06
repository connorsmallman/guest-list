export type GuestDTO = {
  id: string;
  name: string;
  email?: string;
  dietaryRequirements: string | null;
  attending: boolean | null;
  isChild: boolean;
  household: number | null;
};
