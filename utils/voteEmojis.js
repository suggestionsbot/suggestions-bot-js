require('dotenv-flow').config();
const isProduction = () => process.env.NODE_ENV === 'production';

module.exports = [
  {
    id: 0,
    name: 'defaultEmojis',
    fullName: 'Defaults',
    emojis: isProduction()
      ? ['605265580416565269', '605265598343020545']
      : ['578409088157876255', '578409123876438027'],
    custom: true
  },
  {
    id: 1,
    name: 'oldDefaults',
    fullName: 'Old Defaults',
    emojis: ['✅', '❌'],
    custom: false
  },
  {
    id: 2,
    name: 'thumbsEmojis',
    fullName: 'Thumbs',
    emojis: ['👍', '👎'],
    custom: false
  },
  {
    id: 3,
    name: 'arrowsEmojis',
    fullName: 'Arrows',
    emojis: ['⬆', '⬇'],
    custom: false
  },
  {
    id: 4,
    name: 'greenEmojis',
    fullName: 'Green',
    emojis: ['✅', '❎'],
    custom: false
  },
  {
    id: 5,
    name: 'fancyEmojis',
    fullName: 'Fancy',
    emojis: isProduction()
      ? ['605265652856389642', '605265697794162690']
      : ['555537247881920521', '555537277200367627'],
    custom: true
  }
];
