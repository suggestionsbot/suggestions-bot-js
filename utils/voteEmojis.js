const voteEmojis = client => [
  {
    id: 0,
    name: 'defaultEmojis',
    fullName: 'Defaults',
    emojis: [
      client.emojis.find(e => e.name === 'nerdSuccess'),
      client.emojis.find(e => e.name === 'nerdError')
    ]
  },
  {
    id: 1,
    name: 'oldDefaults',
    fullName: 'Old Defaults',
    emojis: ['✅', '❌']
  },
  {
    id: 2,
    name: 'thumbsEmojis',
    fullName: 'Thumbs',
    emojis: ['👍', '👎']
  },
  {
    id: 3,
    name: 'arrowsEmojis',
    fullName: 'Arrows',
    emojis: ['⬆', '⬇']
  },
  {
    id: 4,
    name: 'greenEmojis',
    fullName: 'Green',
    emojis: ['✅', '❎']
  },
  {
    id: 5,
    name: 'fancyEmojis',
    fullName: 'Fancy',
    emojis: [
      client.emojis.find(e => e.name === 'nerdApprove'),
      client.emojis.find(e => e.name === 'nerdDisapprove')
    ]
  }
];

module.exports = voteEmojis;
