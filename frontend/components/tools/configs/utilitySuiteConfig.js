import * as up from '../../../lib/utilityProcessors';
import * as tp from '../../../lib/textProcessors';
import * as dp from '../../../lib/developerProcessors';

export const UTILITY_TEXT_CONFIGS = [
  {
    slug: 'percentage-calculator',
    name: 'Percentage Calculator',
    description: 'Calculate percentages, increases, and decreases.',
    dualInput: true,
    inputBLabel: 'Percentage',
    options: [
      { value: 'of', label: 'X% of value' },
      { value: 'increase', label: 'Increase by %' },
      { value: 'decrease', label: 'Decrease by %' },
      { value: 'percent', label: 'What % is X of Y' }
    ],
    process: async ({ input, inputB, option }) => up.percentageCalc(input, inputB, option)
  },
  {
    slug: 'gst-calculator',
    name: 'GST Calculator',
    description: 'Calculate GST inclusive and exclusive amounts.',
    dualInput: true,
    inputBLabel: 'GST rate (%)',
    options: [
      { value: 'exclusive', label: 'Add GST' },
      { value: 'inclusive', label: 'Remove GST' }
    ],
    process: async ({ input, inputB, option }) => up.gstCalc(input, inputB, option === 'inclusive')
  },
  {
    slug: 'sip-calculator',
    name: 'SIP Calculator',
    description: 'Estimate SIP investment returns.',
    dualInput: true,
    inputBLabel: 'Annual rate (%)',
    numberField: true,
    defaultNumber: 10,
    process: async ({ input, inputB, numberOpt }) => up.sipCalc(input, inputB, numberOpt)
  },
  {
    slug: 'timezone-converter',
    name: 'Time Zone Converter',
    description: 'Convert date/time between time zones.',
    options: [
      { value: 'America/New_York', label: 'New York' },
      { value: 'Europe/London', label: 'London' },
      { value: 'Asia/Tokyo', label: 'Tokyo' },
      { value: 'Asia/Kolkata', label: 'India' }
    ],
    process: async ({ input, option }) => up.timezoneConvert(input, 'UTC', option)
  },
  {
    slug: 'random-number-generator',
    name: 'Random Number Generator',
    description: 'Generate random numbers in a range.',
    dualInput: true,
    inputLabel: 'Min',
    inputBLabel: 'Max',
    process: async ({ input, inputB }) => up.randomNumber(input, inputB)
  },
  {
    slug: 'util-uuid-generator',
    name: 'UUID Generator',
    description: 'Generate random UUID v4 identifiers.',
    hideInput: true,
    autoRun: true,
    buttonLabel: 'Generate another',
    process: async () => dp.generateUuid()
  },
  {
    slug: 'text-counter',
    name: 'Text Counter',
    description: 'Count characters, words, lines, and sentences.',
    mode: 'live-stats',
    statsFn: (input) => {
      const s = tp.countTextStats(input);
      return { Characters: s.characters, Words: s.words, Lines: input ? input.split('\n').length : 0, Sentences: s.sentences };
    },
    process: async ({ input }) => tp.countTextStats(input)
  },
  {
    slug: 'util-case-converter',
    name: 'Case Converter',
    description: 'Convert text between case formats.',
    options: [
      { value: 'upper', label: 'UPPERCASE' },
      { value: 'lower', label: 'lowercase' },
      { value: 'title', label: 'Title Case' },
      { value: 'sentence', label: 'Sentence case' }
    ],
    process: async ({ input, option }) => tp.convertCase(input, option)
  },
  {
    slug: 'number-to-words',
    name: 'Number to Words',
    description: 'Convert numbers to English words.',
    process: async ({ input }) => up.numberToWords(input)
  },
  {
    slug: 'binary-converter',
    name: 'Binary Converter',
    description: 'Convert between binary and decimal.',
    options: [
      { value: 'bin', label: 'Binary to decimal' },
      { value: 'dec', label: 'Decimal to binary' }
    ],
    process: async ({ input, option }) => up.binaryConvert(input, option)
  },
  {
    slug: 'decimal-converter',
    name: 'Decimal Converter',
    description: 'Convert between decimal and hexadecimal.',
    options: [
      { value: 'hex', label: 'Hex to decimal' },
      { value: 'dec', label: 'Decimal to hex' }
    ],
    process: async ({ input, option }) => up.decimalConvert(input, option)
  },
  {
    slug: 'roman-numeral-converter',
    name: 'Roman Numeral Converter',
    description: 'Convert numbers to Roman numerals.',
    process: async ({ input }) => up.romanNumeral(input)
  },
  {
    slug: 'loan-calculator',
    name: 'Loan Calculator',
    description: 'Calculate monthly EMI for loans.',
    dualInput: true,
    inputBLabel: 'Annual rate (%)',
    numberField: true,
    defaultNumber: 5,
    process: async ({ input, inputB, numberOpt }) => up.loanCalc(input, inputB, numberOpt)
  },
  {
    slug: 'tip-calculator',
    name: 'Tip Calculator',
    description: 'Calculate tip and split bill per person.',
    dualInput: true,
    inputBLabel: 'Tip %',
    numberField: true,
    defaultNumber: 2,
    process: async ({ input, inputB, numberOpt }) => up.tipCalc(input, inputB, numberOpt)
  },
  {
    slug: 'discount-calculator',
    name: 'Discount Calculator',
    description: 'Calculate discount amount and final price.',
    dualInput: true,
    inputBLabel: 'Discount %',
    process: async ({ input, inputB }) => up.discountCalc(input, inputB)
  },
  {
    slug: 'barcode-generator',
    name: 'Barcode Generator',
    description: 'Generate Code 39 style barcode text representation.',
    process: async ({ input }) => up.generateBarcodeValue(input)
  },
  {
    slug: 'util-random-password',
    name: 'Random Password Generator',
    description: 'Generate secure random passwords.',
    hideInput: true,
    buttonLabel: 'Generate password',
    numberField: true,
    defaultNumber: 14,
    process: async ({ numberOpt }) => {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
      return Array.from({ length: numberOpt }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
    }
  },
  {
    slug: 'qr-code-generator',
    name: 'QR Code Generator',
    description: 'Generate QR code data URL for any text or URL.',
    mode: 'qr',
    process: async ({ input }) => up.generateQrUrl(input)
  }
];

export const UTILITY_INTERACTIVE_CONFIGS = [
  {
    slug: 'countdown-timer',
    name: 'Countdown Timer',
    description: 'Set a countdown timer in minutes.',
    mode: 'countdown'
  },
  {
    slug: 'stopwatch',
    name: 'Stopwatch',
    description: 'Simple stopwatch with lap times.',
    mode: 'stopwatch'
  }
];
