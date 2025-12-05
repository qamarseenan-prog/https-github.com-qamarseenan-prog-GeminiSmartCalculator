import React, { useReducer, useState, useCallback, useEffect } from 'react';
import { History, X, Delete } from 'lucide-react';
import Button from './components/Button';
import SmartInput from './components/SmartInput';
import { CalculatorState, CalculatorAction, Operation, HistoryItem } from './types';

// Utility for formatting numbers
const formatOperand = (operand: string) => {
  if (operand == null) return;
  const [integer, decimal] = operand.split('.');
  if (decimal == null) return new Intl.NumberFormat('en-US').format(parseFloat(integer));
  return `${new Intl.NumberFormat('en-US').format(parseFloat(integer))}.${decimal}`;
};

const INITIAL_STATE: CalculatorState = {
  currentOperand: '0',
  previousOperand: '',
  operation: Operation.None,
  overwrite: false,
};

function evaluate({ currentOperand, previousOperand, operation }: CalculatorState): string {
  const prev = parseFloat(previousOperand);
  const current = parseFloat(currentOperand);
  if (isNaN(prev) || isNaN(current)) return "";
  let computation = 0;
  switch (operation) {
    case Operation.Add:
      computation = prev + current;
      break;
    case Operation.Subtract:
      computation = prev - current;
      break;
    case Operation.Multiply:
      computation = prev * current;
      break;
    case Operation.Divide:
      computation = prev / current;
      break;
  }
  return computation.toString();
}

function reducer(state: CalculatorState, action: CalculatorAction): CalculatorState {
  switch (action.type) {
    case 'ADD_DIGIT':
      if (state.overwrite) {
        return {
          ...state,
          currentOperand: action.payload,
          overwrite: false,
        };
      }
      if (action.payload === '0' && state.currentOperand === '0') return state;
      if (action.payload === '.' && state.currentOperand.includes('.')) return state;
      if (state.currentOperand === '0' && action.payload !== '.') {
          return { ...state, currentOperand: action.payload };
      }
      return {
        ...state,
        currentOperand: `${state.currentOperand || ''}${action.payload}`,
      };

    case 'CHOOSE_OPERATION':
      if (state.currentOperand === '' && state.previousOperand === '') return state;

      if (state.currentOperand === '') {
        return {
          ...state,
          operation: action.payload,
        };
      }

      if (state.previousOperand === '') {
        return {
          ...state,
          operation: action.payload,
          previousOperand: state.currentOperand,
          currentOperand: '',
        };
      }

      return {
        ...state,
        previousOperand: evaluate(state),
        operation: action.payload,
        currentOperand: '',
      };

    case 'CLEAR':
      return INITIAL_STATE;

    case 'DELETE_DIGIT':
      if (state.overwrite) {
        return {
          ...state,
          overwrite: false,
          currentOperand: '0',
        };
      }
      if (state.currentOperand === '') return state;
      if (state.currentOperand.length === 1) {
        return { ...state, currentOperand: '0' };
      }
      return {
        ...state,
        currentOperand: state.currentOperand.slice(0, -1),
      };

    case 'EVALUATE':
      if (
        state.operation === Operation.None ||
        state.currentOperand === '' ||
        state.previousOperand === ''
      ) {
        return state;
      }
      return {
        ...state,
        overwrite: true,
        previousOperand: '',
        operation: Operation.None,
        currentOperand: evaluate(state),
      };
      
    case 'SET_RESULT':
       return {
           ...INITIAL_STATE,
           currentOperand: action.payload,
           overwrite: true,
       }

    case 'PERCENTAGE':
      if (state.currentOperand === '') return state;
      return {
        ...state,
        currentOperand: (parseFloat(state.currentOperand) / 100).toString(),
        overwrite: true
      };

    case 'TOGGLE_SIGN':
      if (state.currentOperand === '' || state.currentOperand === '0') return state;
      return {
        ...state,
        currentOperand: (parseFloat(state.currentOperand) * -1).toString(),
      };

    default:
      return state;
  }
}

const App: React.FC = () => {
  const [state, dispatch] = useReducer(reducer, INITIAL_STATE);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  // Add a history item whenever we successfully evaluate
  const handleEvaluate = () => {
    if (state.operation !== Operation.None && state.currentOperand && state.previousOperand) {
      const result = evaluate(state);
      const expression = `${state.previousOperand} ${state.operation} ${state.currentOperand}`;
      addToHistory(expression, result);
      dispatch({ type: 'EVALUATE' });
    }
  };

  const addToHistory = (expression: string, result: string, isAiGenerated: boolean = false) => {
      const newItem: HistoryItem = {
          id: Date.now().toString(),
          expression,
          result,
          timestamp: Date.now(),
          isAiGenerated
      };
      setHistory(prev => [newItem, ...prev]);
  };

  const handleAiResult = (expression: string, result: string) => {
      dispatch({ type: 'SET_RESULT', payload: result });
      addToHistory(expression, result, true);
  };

  // Keyboard support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key >= '0' && e.key <= '9') dispatch({ type: 'ADD_DIGIT', payload: e.key });
        if (e.key === '.') dispatch({ type: 'ADD_DIGIT', payload: '.' });
        if (e.key === '=') handleEvaluate();
        if (e.key === 'Enter') {
            e.preventDefault();
            handleEvaluate();
        }
        if (e.key === 'Backspace') dispatch({ type: 'DELETE_DIGIT' });
        if (e.key === 'Escape') dispatch({ type: 'CLEAR' });
        if (e.key === '+') dispatch({ type: 'CHOOSE_OPERATION', payload: Operation.Add });
        if (e.key === '-') dispatch({ type: 'CHOOSE_OPERATION', payload: Operation.Subtract });
        if (e.key === '*') dispatch({ type: 'CHOOSE_OPERATION', payload: Operation.Multiply });
        if (e.key === '/') {
            e.preventDefault();
            dispatch({ type: 'CHOOSE_OPERATION', payload: Operation.Divide });
        }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [state]); // Re-bind when state changes for evaluate closure if needed, but dispatch is stable. 
  // Wait, handleEvaluate depends on state. We should check dependency.
  // Actually simpler to just not depend on state inside the effect by using refs or functional updates,
  // but for this simple app, re-binding or ignoring the exhaustive-deps with care is okay. 
  // Let's rely on the fact that dispatch handles most logic. 
  // However, handleEvaluate NEEDS current state.
  // Better approach: Since handleEvaluate is closed over 'state', we need it in dependency array.
  
  // Re-write effect to use current state cleanly or avoid closure staleness.
  useEffect(() => {
     // This is just a simple binding, React 18 handles updates well.
  }, []);

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4 font-sans">
      
      {/* Background Gradients */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
          <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-indigo-900/20 rounded-full blur-[120px]" />
          <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-emerald-900/10 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 w-full max-w-md bg-gray-900/80 backdrop-blur-xl border border-gray-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden">
        
        {/* Header / History Toggle */}
        <div className="flex items-center justify-between p-4 border-b border-gray-800">
           <h1 className="text-gray-400 text-sm font-medium tracking-wider uppercase">Gemini Calc</h1>
           <button 
             onClick={() => setShowHistory(!showHistory)}
             className={`p-2 rounded-lg transition-colors ${showHistory ? 'bg-indigo-600 text-white' : 'hover:bg-gray-800 text-gray-400'}`}
           >
             <History size={20} />
           </button>
        </div>

        {/* Smart Input (Gemini) */}
        <div className="px-4 pt-4">
            <SmartInput onResult={handleAiResult} />
        </div>

        {/* Display */}
        <div className="p-6 flex flex-col items-end justify-end h-40 break-all">
          <div className="text-gray-500 text-xl font-light h-8 mb-1">
            {state.operation !== Operation.None && (
                <>
                {formatOperand(state.previousOperand)} {state.operation}
                </>
            )}
          </div>
          <div className="text-white text-5xl sm:text-6xl font-light tracking-tight">
            {formatOperand(state.currentOperand) || '0'}
          </div>
        </div>

        {/* Keypad */}
        <div className="p-4 grid grid-cols-4 gap-3 sm:gap-4 bg-gray-900/50">
          <Button label="AC" onClick={() => dispatch({ type: 'CLEAR' })} variant="secondary" />
          <Button label="+/-" onClick={() => dispatch({ type: 'TOGGLE_SIGN' })} variant="secondary" />
          <Button label="%" onClick={() => dispatch({ type: 'PERCENTAGE' })} variant="secondary" />
          <Button label="÷" onClick={() => dispatch({ type: 'CHOOSE_OPERATION', payload: Operation.Divide })} variant="primary" />
          
          <Button label="7" onClick={() => dispatch({ type: 'ADD_DIGIT', payload: '7' })} />
          <Button label="8" onClick={() => dispatch({ type: 'ADD_DIGIT', payload: '8' })} />
          <Button label="9" onClick={() => dispatch({ type: 'ADD_DIGIT', payload: '9' })} />
          <Button label="×" onClick={() => dispatch({ type: 'CHOOSE_OPERATION', payload: Operation.Multiply })} variant="primary" />
          
          <Button label="4" onClick={() => dispatch({ type: 'ADD_DIGIT', payload: '4' })} />
          <Button label="5" onClick={() => dispatch({ type: 'ADD_DIGIT', payload: '5' })} />
          <Button label="6" onClick={() => dispatch({ type: 'ADD_DIGIT', payload: '6' })} />
          <Button label="-" onClick={() => dispatch({ type: 'CHOOSE_OPERATION', payload: Operation.Subtract })} variant="primary" />
          
          <Button label="1" onClick={() => dispatch({ type: 'ADD_DIGIT', payload: '1' })} />
          <Button label="2" onClick={() => dispatch({ type: 'ADD_DIGIT', payload: '2' })} />
          <Button label="3" onClick={() => dispatch({ type: 'ADD_DIGIT', payload: '3' })} />
          <Button label="+" onClick={() => dispatch({ type: 'CHOOSE_OPERATION', payload: Operation.Add })} variant="primary" />
          
          <Button label="0" onClick={() => dispatch({ type: 'ADD_DIGIT', payload: '0' })} span={2} />
          <Button label="." onClick={() => dispatch({ type: 'ADD_DIGIT', payload: '.' })} />
          <Button label="=" onClick={handleEvaluate} variant="accent" />
        </div>

        {/* History Sidebar/Overlay */}
        <div className={`absolute inset-0 bg-gray-900/95 backdrop-blur-xl transition-transform duration-300 ease-in-out z-20 flex flex-col ${showHistory ? 'translate-x-0' : 'translate-x-full'}`}>
           <div className="flex items-center justify-between p-4 border-b border-gray-800">
             <h2 className="text-white text-lg font-medium">History</h2>
             <button onClick={() => setShowHistory(false)} className="p-2 hover:bg-gray-800 rounded-lg text-gray-400">
               <X size={20} />
             </button>
           </div>
           
           <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide">
              {history.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-gray-500 gap-2">
                      <History size={48} className="opacity-20" />
                      <p>No calculations yet</p>
                  </div>
              ) : (
                  history.map((item) => (
                      <div key={item.id} className="bg-gray-800/50 p-4 rounded-xl border border-gray-700/50 hover:bg-gray-800 transition-colors">
                          <div className="flex items-center justify-between mb-1">
                              <span className="text-gray-400 text-sm">{item.expression}</span>
                              {item.isAiGenerated && (
                                  <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded-full flex items-center gap-1">
                                      <SmartInputIcon className="w-3 h-3" /> Gemini
                                  </span>
                              )}
                          </div>
                          <div className="text-white text-xl font-light text-right">{item.result}</div>
                      </div>
                  ))
              )}
           </div>
           
           {history.length > 0 && (
               <div className="p-4 border-t border-gray-800">
                   <button 
                    onClick={() => setHistory([])}
                    className="w-full py-3 bg-red-500/10 text-red-500 hover:bg-red-500/20 rounded-xl flex items-center justify-center gap-2 transition-colors"
                   >
                       <Delete size={18} /> Clear History
                   </button>
               </div>
           )}
        </div>

      </div>
    </div>
  );
};

// Mini helper component for the history AI badge
const SmartInputIcon = ({className}:{className?:string}) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2L12 22" /><path d="M17 7L7 17" /><path d="M7 7L17 17" />
    </svg>
);

export default App;
