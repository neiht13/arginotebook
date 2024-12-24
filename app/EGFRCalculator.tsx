// components/EGFRCalculator.tsx
'use client';

import React, { useState } from 'react';
import Result from './components/Result';
import Button from './components/Button';
import InputGroup from './components/InputGroup';
import FormulaText from './components/FormulaText';
import CustomSelect from './components/CustomSelect';
import { useLanguage } from './components/LanguageContext';
import translations from './components/translations';

const EGFRCalculator: React.FC = () => {
  const { language } = useLanguage();
  const t = translations[language].calculator;

  const [egfrResult, setEgfrResult] = useState<number | null>(null);
  const [errorText, setErrorText] = useState<string>('');

  const [creatinine, setCreatinine] = useState<number | ''>('');
  const [creatinineUnit, setCreatinineUnit] = useState<'umol' | 'mgdl'>('umol');
  const [age, setAge] = useState<number | ''>('');
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [ethnicity, setEthnicity] = useState<'non_african' | 'african'>('non_african');
  const [constant, setConstant] = useState<'186' | '175'>('186');

  const calculateEGFR = () => {
    if (
      creatinine === '' ||
      age === '' ||
      !gender ||
      !ethnicity ||
      !constant
    ) {
      setErrorText(t.errorIncomplete);
      return;
    }

    let ageValue = age;
    const currentYear = new Date().getFullYear();

    if (age.toString().length === 4 && age > 1900 && age <= currentYear) {
      ageValue = currentYear - age;
    } else if (age <= 0 || age > 150) {
      setErrorText(t.errorInvalidAge);
      return;
    }

    let creatinine_mg_dL = creatinineUnit === 'umol' ? (creatinine as number) / 88.4 : (creatinine as number);

    let eGFR = parseFloat(constant) * Math.pow(creatinine_mg_dL, -1.154) * Math.pow(ageValue as number, -0.203);

    if (gender === 'female') eGFR *= 0.742;
    if (ethnicity === 'african') eGFR *= 1.212;
    setErrorText('');
    setEgfrResult(eGFR);
  };

  const getEGFRFormula = () => {
    if (creatinineUnit === 'umol') {
      return (
        <FormulaText>
          <strong>{t.formulaEGFR_umol}</strong><br />
          eGFR = {constant} × ((Creatinine / 88.4)<sup>-1.154</sup>) × (Age<sup>-0.203</sup>) × (0.742 {t.ifFemale}) × (1.212 {t.ifAfrican})
        </FormulaText>
      );
    } else {
      return (
        <FormulaText>
          <strong>{t.formulaEGFR}</strong><br />
          eGFR = {constant} × (Creatinine<sup>-1.154</sup>) × (Age<sup>-0.203</sup>) × (0.742 {t.ifFemale}) × (1.212 {t.ifAfrican})
        </FormulaText>
      );
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-4">
        {t.egfr}<br />({t.methodMDRD})
      </h1>
      {getEGFRFormula()}
      <div className="w-full flex items-center mb-5"> {/* Thêm items-center để căn giữa theo chiều dọc */}
        <InputGroup
          label={t.creatinine}
          type="number"
          placeholder={t.creatininePlaceholder}
          value={creatinine}
          onChange={(value) => setCreatinine(value === '' ? '' : (typeof value === 'number' ? value : parseFloat(value)))}
          className="w-full h-12 p-3 rounded-xl rounded-r-none bg-gray-100 focus:border focus:border-[tomato] focus:border-[tomato] focus:outline-none"
          required
          suffix={<CustomSelect
            options={[
              { value: 'umol', label: 'µmol/L' },
              { value: 'mgdl', label: 'mg/dL' },
            ]}
            value={creatinineUnit}
            onChange={(value) => setCreatinineUnit(value as 'umol' | 'mgdl')}
            placeholder={t.unit}
            className="h-12 rounded-r-xl border-l-0" 
            isSuffix={true}
          />}
        />
        {/* <CustomSelect
          options={[
            { value: 'umol', label: 'µmol/L' },
            { value: 'mgdl', label: 'mg/dL' },
          ]}
          value={creatinineUnit}
          onChange={(value) => setCreatinineUnit(value as 'umol' | 'mgdl')}
          placeholder={t.unit}
          className="h-12 mt-7 rounded-r-xl border-l-0" 
          isSuffix={true}
        /> */}
      </div>


      <div className="grid grid-cols-2 gap-5 mb-5">
        <InputGroup
          label={t.age}
          type="number"
          placeholder={t.agePlaceholder}
          value={age}
          onChange={(value) => setAge(value === '' ? '' : (typeof value === 'number' ? value : parseInt(value)))}
          className="w-full h-12 p-3 rounded-xl bg-gray-100 focus:border focus:border-[tomato] focus:border-[tomato] focus:outline-none"
          required
        />

        <div className="">
          <label className="block h-6 mb-1 font-bold text-gray-700">{t.gender}</label>
          <CustomSelect
            options={[
              { prefix: "👨", value: 'male', label: 'Nam' },
              { prefix: "👩", value: 'female', label: 'Nữ' },
            ]}
            value={gender}
            onChange={(value) => setGender(value as 'male' | 'female')}
            placeholder={t.genderPlaceholder}
            className="rounded-xl"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-5 mb-5">
        <div className="mb-5">
          <label className="block font-bold mb-1  text-gray-700">{t.ethnicity}</label>
          <CustomSelect
            options={[
              { value: 'non_african', label: t.nonAfrican },
              { value: 'african', label: t.african },
            ]}
            value={ethnicity}
            onChange={(value) => setEthnicity(value as 'non_african' | 'african')}
            placeholder={t.ethnicityPlaceholder}
            className="rounded-xl"
          />
        </div>
        <div className="mb-5">
          <label className="block font-bold mb-1  text-gray-700">{t.constant}</label>
          <CustomSelect
            options={[
              { value: '186', label: '186' },
              { value: '175', label: '175' },
            ]}
            value={constant}
            onChange={(value) => setConstant(value as '186' | '175')}
            placeholder={t.constantPlaceholder}
            className="rounded-xl"
          />
        </div>
      </div>

      <div className='w-full flex justify-center'>
        <Button onClick={calculateEGFR} className='w-2/3'>
          {t.calculate}
        </Button>
      </div>

      {egfrResult !== null && <Result type="egfr" value={egfrResult} />}
      {errorText && (
        <div className="mt-5 text-lg font-bold text-center p-2 rounded-2xl bg-red-100 text-red-700">
          {errorText}
        </div>
      )}
    </div>
  );
};

export default EGFRCalculator;
