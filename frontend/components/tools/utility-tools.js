import { useState } from 'react';
import useToolRequest from '../../hooks/useToolRequest';
import * as api from '../../services/api';
import {
  NumberField,
  PrimaryButton,
  SelectField,
  ToolActions,
  ToolError,
  ToolLoading,
  ToolPanel
} from './shared';

export function UnitConverterTool() {
  const [value, setValue] = useState('1');
  const [category, setCategory] = useState('length');
  const [fromUnit, setFromUnit] = useState('m');
  const [toUnit, setToUnit] = useState('km');
  const { loading, error, result, run } = useToolRequest();

  const unitOptions = {
    length: [
      { value: 'm', label: 'Meters' },
      { value: 'km', label: 'Kilometers' },
      { value: 'cm', label: 'Centimeters' },
      { value: 'ft', label: 'Feet' },
      { value: 'mi', label: 'Miles' }
    ],
    mass: [
      { value: 'kg', label: 'Kilograms' },
      { value: 'g', label: 'Grams' },
      { value: 'lb', label: 'Pounds' },
      { value: 'oz', label: 'Ounces' }
    ],
    temperature: [
      { value: 'c', label: 'Celsius' },
      { value: 'f', label: 'Fahrenheit' },
      { value: 'k', label: 'Kelvin' }
    ]
  };

  return (
    <ToolPanel>
      <SelectField
        label="Category"
        value={category}
        onChange={(next) => {
          setCategory(next);
          setFromUnit(unitOptions[next][0].value);
          setToUnit(unitOptions[next][1]?.value || unitOptions[next][0].value);
        }}
        options={[
          { value: 'length', label: 'Length' },
          { value: 'mass', label: 'Mass' },
          { value: 'temperature', label: 'Temperature' }
        ]}
      />
      <NumberField label="Value" value={value} onChange={setValue} />
      <div className="grid gap-3 sm:grid-cols-2">
        <SelectField label="From" value={fromUnit} onChange={setFromUnit} options={unitOptions[category]} />
        <SelectField label="To" value={toUnit} onChange={setToUnit} options={unitOptions[category]} />
      </div>
      <ToolActions>
        <PrimaryButton
          onClick={() => run(() => api.convertUnit({ value, fromUnit, toUnit, category }))}
          disabled={loading}
        >
          Convert
        </PrimaryButton>
      </ToolActions>
      <ToolLoading loading={loading} text="Converting..." />
      <ToolError message={error} />
      {result && <p className="animate-fade-in text-sm text-body">Result: <strong>{result.result}</strong></p>}
    </ToolPanel>
  );
}

export function AgeCalculatorTool() {
  const [birthDate, setBirthDate] = useState('');
  const { loading, error, result, run } = useToolRequest();

  return (
    <ToolPanel>
      <label className="block">
        <span className="label-text">Date of birth</span>
        <input
          type="date"
          value={birthDate}
          onChange={(e) => setBirthDate(e.target.value)}
          className="input-field sm:w-64"
        />
      </label>
      <ToolActions>
        <PrimaryButton
          onClick={() => {
            if (!birthDate) return run(() => Promise.reject(new Error('Birth date is required.')));
            return run(() => api.calculateAge(birthDate));
          }}
          disabled={loading}
        >
          Calculate Age
        </PrimaryButton>
      </ToolActions>
      <ToolLoading loading={loading} text="Calculating..." />
      <ToolError message={error} />
      {result && (
        <p className="animate-fade-in text-sm text-body">
          Age: <strong>{result.years}</strong> years, <strong>{result.months}</strong> months,{' '}
          <strong>{result.days}</strong> days ({result.totalDays} total days)
        </p>
      )}
    </ToolPanel>
  );
}

export function EmiCalculatorTool() {
  const [principal, setPrincipal] = useState('100000');
  const [annualRate, setAnnualRate] = useState('8.5');
  const [tenureMonths, setTenureMonths] = useState('120');
  const { loading, error, result, run } = useToolRequest();

  return (
    <ToolPanel>
      <div className="grid gap-3 sm:grid-cols-3">
        <NumberField label="Principal" value={principal} onChange={setPrincipal} />
        <NumberField label="Annual rate (%)" value={annualRate} onChange={setAnnualRate} />
        <NumberField label="Tenure (months)" value={tenureMonths} onChange={setTenureMonths} />
      </div>
      <ToolActions>
        <PrimaryButton
          onClick={() => run(() => api.calculateEmi(principal, annualRate, tenureMonths))}
          disabled={loading}
        >
          Calculate EMI
        </PrimaryButton>
      </ToolActions>
      <ToolLoading loading={loading} text="Calculating EMI..." />
      <ToolError message={error} />
      {result && (
        <div className="animate-fade-in space-y-1 text-sm text-body">
          <p>Monthly EMI: <strong>{result.emi}</strong></p>
          <p>Total payment: <strong>{result.totalPayment}</strong></p>
          <p>Total interest: <strong>{result.totalInterest}</strong></p>
        </div>
      )}
    </ToolPanel>
  );
}

export function CurrencyConverterTool() {
  const [amount, setAmount] = useState('100');
  const [fromCurrency, setFromCurrency] = useState('USD');
  const [toCurrency, setToCurrency] = useState('EUR');
  const { loading, error, result, run } = useToolRequest();

  return (
    <ToolPanel>
      <NumberField label="Amount" value={amount} onChange={setAmount} />
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block">
          <span className="label-text">From</span>
          <input value={fromCurrency} onChange={(e) => setFromCurrency(e.target.value.toUpperCase())} className="input-field" />
        </label>
        <label className="block">
          <span className="label-text">To</span>
          <input value={toCurrency} onChange={(e) => setToCurrency(e.target.value.toUpperCase())} className="input-field" />
        </label>
      </div>
      <ToolActions>
        <PrimaryButton
          onClick={() => run(() => api.convertCurrency(amount, fromCurrency, toCurrency))}
          disabled={loading}
        >
          Convert Currency
        </PrimaryButton>
      </ToolActions>
      <ToolLoading loading={loading} text="Fetching live rates..." />
      <ToolError message={error} />
      {result && (
        <p className="animate-fade-in text-sm text-body">
          Result: <strong>{result.result}</strong> (rate {result.rate}, {result.date})
        </p>
      )}
    </ToolPanel>
  );
}
