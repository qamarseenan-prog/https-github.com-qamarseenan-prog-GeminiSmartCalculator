export enum Operation {
  Add = '+',
  Subtract = '-',
  Multiply = '×',
  Divide = '÷',
  None = ''
}

export interface CalculatorState {
  currentOperand: string;
  previousOperand: string;
  operation: Operation;
  overwrite: boolean; // Flag to overwrite current operand on next number input after a result
}

export interface HistoryItem {
  id: string;
  expression: string;
  result: string;
  timestamp: number;
  isAiGenerated: boolean;
}

export type CalculatorAction =
  | { type: 'ADD_DIGIT'; payload: string }
  | { type: 'CHOOSE_OPERATION'; payload: Operation }
  | { type: 'CLEAR' }
  | { type: 'DELETE_DIGIT' }
  | { type: 'EVALUATE' }
  | { type: 'SET_RESULT'; payload: string } // Used for AI results
  | { type: 'PERCENTAGE' }
  | { type: 'TOGGLE_SIGN' };
