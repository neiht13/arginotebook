// components/LDLCalculator.tsx
'use client';

import React, { useState } from 'react';
import Result from './components/Result';
import Button from './components/Button';
import InputGroup from './components/InputGroup';
import FormulaText from './components/FormulaText';
import CustomSelect from './components/CustomSelect';
import { useLanguage } from './components/LanguageContext';
import translations from './components/translations';

const LDLCalculator: React.FC = () => {
  const { language } = useLanguage();
  const t = translations[language].calculator;

  const [ldlResult, setLdlResult] = useState<number | null>(null);
  const [errorText, setErrorText] = useState<string>('');

  const [totalChol, setTotalChol] = useState<number | ''>('');
  const [cholUnit, setCholUnit] = useState<'mmol/L' | 'mg/dl'>('mmol/L');
  const [hdl, setHdl] = useState<number | ''>('');
  const [hdlUnit, setHdlUnit] = useState<'mmol/L' | 'mg/dl'>('mmol/L');
  const [trig, setTrig] = useState<number | ''>('');
  const [trigUnit, setTrigUnit] = useState<'mmol/L' | 'mg/dl'>('mmol/L');

  const calculateLDL = () => {
    if (
      totalChol === '' ||
      hdl === '' ||
      trig === '' ||
      cholUnit !== hdlUnit ||
      cholUnit !== trigUnit
    ) {
      setErrorText(t.errorIncomplete);
      setLdlResult(null);
      return;
    }

    if (
      (totalChol as number) < 0 ||
      (hdl as number) < 0 ||
      (trig as number) < 0
    ) {
      setErrorText(t.errorNegative);
      setLdlResult(null);
      return;
    }

    let ldl: number;

    if (cholUnit === 'mmol/L') {
      ldl = (totalChol as number) - (hdl as number) - (trig as number) / 2.2;
    } else {
      ldl = (totalChol as number) - (hdl as number) - (trig as number) / 5;
    }

    if (ldl < 0) {
      setErrorText(t.errorTrigTooHigh);
      setLdlResult(null);
      return;
    }

    setLdlResult(ldl);
    setErrorText('');
  };

  const getLDLFormula = () => {
    if (
      cholUnit === 'mmol/L' &&
      hdlUnit === 'mmol/L' &&
      trigUnit === 'mmol/L'
    ) {
      return (
        <FormulaText>
          <strong>{t.formulaLDL}</strong>
          <br />
          LDL = CHOL - HDL - (TRIG / 2.2)
        </FormulaText>
      );
    } else if (
      cholUnit === 'mg/dl' &&
      hdlUnit === 'mg/dl' &&
      trigUnit === 'mg/dl'
    ) {
      return (
        <FormulaText>
          <strong>{t.formulaLDL}</strong>
          <br />
          LDL = CHOL - HDL - (TRIG / 5)
        </FormulaText>
      );
    } else {
      return <FormulaText>{t.selectSameUnitPrompt}</FormulaText>;
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-4">{t.ldl}</h1>
      {getLDLFormula()}

      {/* Trường hợp input phức tạp: Total Cholesterol + Unit */}
      <div className="mb-5">
        <div className="flex w-full">
          <InputGroup
            label={t.totalCholesterol}
            type="number"
            placeholder={t.totalCholPlaceholder} // Thêm khóa này trong translations
            value={totalChol}
            onChange={(value) =>
              setTotalChol(value === '' ? '' : (typeof value === 'number' ? value : parseFloat(value)))
            }
            className="w-full h-12 p-3 rounded-xl rounded-r-none bg-slate-100 focus:border focus:border-[tomato] focus:border-[tomato] focus:outline-none"
            required
            suffix={

              <CustomSelect
                options={[
                  { value: 'mmol/L', label: 'mmol/L' },
                  { value: 'mg/dl', label: 'mg/dL' },
                ]}
                value={cholUnit}
                onChange={(value) => {
                  setCholUnit(value as 'mmol/L' | 'mg/dl');
                  setHdlUnit(value as 'mmol/L' | 'mg/dl');
                  setTrigUnit(value as 'mmol/L' | 'mg/dl');
                }}
                placeholder={t.unit}
                className="h-12 rounded-r-xl border-l-0"
                isSuffix={true}
              />
            }
          />
        </div>
      </div>

      {/* Trường hợp input phức tạp: HDL + Unit */}
      <div className="mb-5">
        <div className="flex">
          <InputGroup
            label={t.hdlCholesterol}
            type="number"
            placeholder={t.hdlCholPlaceholder} // Thêm khóa này trong translations
            value={hdl}
            onChange={(value) =>
              setHdl(value === '' ? '' : (typeof value === 'number' ? value : parseFloat(value)))
            }
            className="w-full h-12 p-3 rounded-xl rounded-r-none bg-slate-100 focus:border focus:border-[tomato] focus:border-[tomato] focus:outline-none"
            required
            suffix={

              <CustomSelect
                options={[
                  { value: 'mmol/L', label: 'mmol/L' },
                  { value: 'mg/dl', label: 'mg/dL' },
                ]}
                value={hdlUnit}
                onChange={(value) => {
                  setHdlUnit(value as 'mmol/L' | 'mg/dl');
                  setCholUnit(value as 'mmol/L' | 'mg/dl');
                  setTrigUnit(value as 'mmol/L' | 'mg/dl');
                }}
                placeholder={t.unit}

                className="h-12 rounded-r-xl border-l-0"
                isSuffix={true}
              />
            }
          />
        </div>
      </div>

      {/* Trường hợp input phức tạp: Triglycerides + Unit */}
      <div className="mb-5">
        <div className="flex">
          <InputGroup
            label={t.triglycerides}
            type="number"
            placeholder={t.trigPlaceholder} // Thêm khóa này trong translations
            value={trig}
            onChange={(value) =>
              setTrig(value === '' ? '' : (typeof value === 'number' ? value : parseFloat(value)))
            }
            className="w-full h-12 p-3 rounded-xl rounded-r-none bg-slate-100 focus:border focus:border-[tomato] focus:border-[tomato] focus:outline-none"
            required
            suffix={
              <CustomSelect
                options={[
                  { value: 'mmol/L', label: 'mmol/L' },
                  { value: 'mg/dl', label: 'mg/dL' },
                ]}
                value={trigUnit}
                onChange={(value) => {
                  setTrigUnit(value as 'mmol/L' | 'mg/dl');
                  setCholUnit(value as 'mmol/L' | 'mg/dl');
                  setHdlUnit(value as 'mmol/L' | 'mg/dl');
                }}
                placeholder={t.unit}
                className="h-12 rounded-r-xl border-l-0"
                isSuffix={true}
              />
            }
          />

        </div>
      </div>

      <div className="w-full flex justify-center">
        <Button onClick={calculateLDL} className="w-2/3">
          {t.ldlCalculate}
        </Button>
      </div>

      {ldlResult !== null && <Result type="ldl" value={ldlResult} unit={cholUnit} />}

      {errorText && (
        <div className="mt-5 text-lg font-bold text-center p-2 rounded-2xl bg-red-100 text-red-700">
          {errorText}
        </div>
      )}
    </div>
  );
};

export default LDLCalculator;
