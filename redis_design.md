# HouseTab — Redis Design

## Overview
HouseTab uses Redis as an in-memory key-value store to handle real-time and 
frequently accessed data. The following four data structures were chosen to 
complement the existing SQLite relational database.

---

## Data Structures

### 1. Current Logged-In Users
**Redis Type:** Set
**Key Pattern:** `loggedInUsers`
**Why:** A Set stores unique values with no duplicates — perfect for tracking 
who is currently logged in since a user can only be logged in once.

**Example:**
Key:   loggedInUsers
Value: { "alex@email.com", "maria@email.com", "james@email.com" }

---

### 2. Unpaid Balances Per User
**Redis Type:** Hash
**Key Pattern:** `balances:{householdID}`
**Why:** A Hash stores field-value pairs — perfect for storing how much each 
user owes in a household. You can update one user's balance without touching 
the others.

**Example:**
Key:    balances:household1
Fields: { alex: 0.00, maria: 60.00, james: 800.00 }

---

### 3. Recent Expenses Per Household
**Redis Type:** List
**Key Pattern:** `recentExpenses:{householdID}`
**Why:** A List stores ordered items — perfect for showing the most recent 
expenses in a household like a feed. New expenses are pushed to the front.

**Example:**
Key:   recentExpenses:household1
Value: [ "Costco Run", "Grocery Run", "Electric Bill", "January Rent" ]

---

### 4. Household Spending Leaderboard
**Redis Type:** Sorted Set
**Key Pattern:** `spending:{householdID}`
**Why:** A Sorted Set stores values with a score — perfect for ranking which 
users have paid the most expenses in a household ordered by total amount spent.

**Example:**
Key:    spending:household1
Values: { alex: 2535.00, maria: 165.00, james: 180.00 }

---

## Redis Commands (CRUD Operations)

### 1. Logged-In Users (Set)

**Initialize:**
FLUSHALL

**Add a user when they log in (Create):**
SADD loggedInUsers "alex@email.com"

**Get all logged-in users (Read):**
SMEMBERS loggedInUsers

**Check if a specific user is logged in (Read):**
SISMEMBER loggedInUsers "alex@email.com"

**Count how many users are logged in (Read):**
SCARD loggedInUsers

**Remove a user when they log out (Delete):**
SREM loggedInUsers "alex@email.com"

---

### 2. Unpaid Balances Per User (Hash)

**Set initial balances for a household (Create):**
HSET balances:household1 alex 0.00 maria 60.00 james 800.00

**Get all balances for a household (Read):**
HGETALL balances:household1

**Get one user's balance (Read):**
HGET balances:household1 james

**Update a user's balance when they pay (Update):**
HSET balances:household1 james 0.00

**Increase a user's balance when new expense added (Update):**
HINCRBYFLOAT balances:household1 maria 45.00

**Delete a user's balance when they leave household (Delete):**
HDEL balances:household1 james

**Delete entire household balance record (Delete):**
DEL balances:household1

---

### 3. Recent Expenses Per Household (List)

**Add a new expense to the front of the list (Create):**
LPUSH recentExpenses:household1 "Costco Run"

**Get all recent expenses (Read):**
LRANGE recentExpenses:household1 0 -1

**Get only the 5 most recent expenses (Read):**
LRANGE recentExpenses:household1 0 4

**Get total number of expenses in list (Read):**
LLEN recentExpenses:household1

**Update an expense title at a specific position (Update):**
LSET recentExpenses:household1 0 "Costco Bulk Run"

**Remove the oldest expense from the list (Delete):**
RPOP recentExpenses:household1

**Remove a specific expense by value (Delete):**
LREM recentExpenses:household1 1 "Gas Bill"

---

### 4. Household Spending Leaderboard (Sorted Set)

**Add users with their total spending (Create):**
ZADD spending:household1 2535.00 alex
ZADD spending:household1 165.00 maria
ZADD spending:household1 180.00 james

**Get leaderboard ranked highest to lowest (Read):**
ZREVRANGE spending:household1 0 -1 WITHSCORES

**Get a specific user's total spending (Read):**
ZSCORE spending:household1 alex

**Get a user's rank on the leaderboard (Read):**
ZREVRANK spending:household1 alex

**Increase a user's spending when they pay an expense (Update):**
ZINCRBY spending:household1 2400.00 alex

**Remove a user from the leaderboard (Delete):**
ZREM spending:household1 james

**Delete entire household leaderboard (Delete):**
DEL spending:household1