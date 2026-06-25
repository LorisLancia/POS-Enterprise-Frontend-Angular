import { Unit } from './unit.model';

export interface UnitConversion {
  id: number;
  companyId: number;
  fromUnitId: number;
  toUnitId: number;
  factor: number;
  isActive: boolean;
  createdAt: string;
  fromUnit?: Unit;
  toUnit?: Unit;
}
