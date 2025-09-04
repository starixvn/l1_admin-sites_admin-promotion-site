export interface Currency {
  Id: string;
  Name: string;
  Code: string;
  Multiplier: number;
  Enabled: boolean;
  IsTest: boolean;
  PartnerId: string;
  GroupId: string;
  DisplayText: string;
  IsUncountOnTotal: boolean;
}