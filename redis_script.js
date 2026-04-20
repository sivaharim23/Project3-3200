const { createClient } = require('redis');

const client = createClient({
  socket: {
    host: 'localhost',
    port: 6379
  }
});

client.on('error', (err) => console.log('Redis Client Error', err));

async function main() {
  await client.connect();
  console.log('Connected to Redis!');

  // =====================
  // 1. LOGGED IN USERS (Set)
  // =====================
  console.log('\n--- Logged In Users (Set) ---');

  // Create — add users when they log in
  await client.sAdd('loggedInUsers', 'alex@email.com');
  await client.sAdd('loggedInUsers', 'maria@email.com');
  await client.sAdd('loggedInUsers', 'james@email.com');
  console.log('Added users to loggedInUsers');

  // Read — get all logged in users
  const loggedInUsers = await client.sMembers('loggedInUsers');
  console.log('Logged in users:', loggedInUsers);

  // Read — check if a user is logged in
  const isLoggedIn = await client.sIsMember('loggedInUsers', 'alex@email.com');
  console.log('Is alex logged in?', isLoggedIn);

  // Delete — remove user when they log out
  await client.sRem('loggedInUsers', 'james@email.com');
  console.log('James logged out');
  const afterLogout = await client.sMembers('loggedInUsers');
  console.log('Logged in users after logout:', afterLogout);

  // =====================
  // 2. UNPAID BALANCES (Hash)
  // =====================
  console.log('\n--- Unpaid Balances (Hash) ---');

  // Create — set initial balances
  await client.hSet('balances:household1', {
    alex: 0.00,
    maria: 60.00,
    james: 800.00
  });
  console.log('Set initial balances');

  // Read — get all balances
  const allBalances = await client.hGetAll('balances:household1');
  console.log('All balances:', allBalances);

  // Read — get one user balance
  const jamesBalance = await client.hGet('balances:household1', 'james');
  console.log('James owes:', jamesBalance);

  // Update — james pays his balance
  await client.hSet('balances:household1', 'james', 0.00);
  console.log('James paid his balance');
  const updatedBalance = await client.hGet('balances:household1', 'james');
  console.log('James new balance:', updatedBalance);

  // Delete — remove a user from balances
  await client.hDel('balances:household1', 'james');
  console.log('Removed james from balances');

  // =====================
  // 3. RECENT EXPENSES (List)
  // =====================
  console.log('\n--- Recent Expenses (List) ---');

  // Create — add expenses to front of list
  await client.lPush('recentExpenses:household1', 'January Rent');
  await client.lPush('recentExpenses:household1', 'Electric Bill');
  await client.lPush('recentExpenses:household1', 'Grocery Run');
  await client.lPush('recentExpenses:household1', 'Costco Run');
  console.log('Added expenses to list');

  // Read — get all recent expenses
  const recentExpenses = await client.lRange('recentExpenses:household1', 0, -1);
  console.log('Recent expenses:', recentExpenses);

  // Read — get only top 2
  const top2 = await client.lRange('recentExpenses:household1', 0, 1);
  console.log('Top 2 most recent:', top2);

  // Update — update expense at position 0
  await client.lSet('recentExpenses:household1', 0, 'Costco Bulk Run');
  console.log('Updated first expense');

  // Delete — remove oldest expense
  await client.rPop('recentExpenses:household1');
  console.log('Removed oldest expense');
  const afterDelete = await client.lRange('recentExpenses:household1', 0, -1);
  console.log('Expenses after delete:', afterDelete);

  // =====================
  // 4. SPENDING LEADERBOARD (Sorted Set)
  // =====================
  console.log('\n--- Spending Leaderboard (Sorted Set) ---');

  // Create — add users with their spending scores
  await client.zAdd('spending:household1', [
    { score: 2535.00, value: 'alex' },
    { score: 165.00, value: 'maria' },
    { score: 180.00, value: 'james' }
  ]);
  console.log('Added spending leaderboard');

  // Read — get leaderboard highest to lowest
  const leaderboard = await client.zRangeWithScores('spending:household1', 0, -1, { REV: true });
  console.log('Spending leaderboard:', leaderboard);

  // Read — get alex's rank
  const alexRank = await client.zRevRank('spending:household1', 'alex');
  console.log('Alex rank:', alexRank);

  // Update — alex pays another expense
  await client.zIncrBy('spending:household1', 2400.00, 'alex');
  console.log('Updated alex spending');
  const alexScore = await client.zScore('spending:household1', 'alex');
  console.log('Alex new total spending:', alexScore);

  // Delete — remove user from leaderboard
  await client.zRem('spending:household1', 'james');
  console.log('Removed james from leaderboard');

  // Cleanup
  await client.del('loggedInUsers');
  await client.del('balances:household1');
  await client.del('recentExpenses:household1');
  await client.del('spending:household1');
  console.log('\nCleaned up all keys');

  await client.disconnect();
  console.log('Disconnected from Redis');
}

main();