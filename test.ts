const options = [{ name: 'wu', memberID: '123' }, { name: 'uwu', memberID: '124' }]

console.log(options.map(option => option.memberID).includes('123'))