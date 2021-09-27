'use strict';

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// BANKIST APP

// DATA
// DIFFERENT DATA! Contains movement dates, currency and locale

const account1 = {
  owner: 'Jonas Schmedtmann',
  movements: [200, 455.23, -306.5, 25000, -642.21, -133.9, 79.97, 1300],
  interestRate: 1.2, // %
  pin: 1111,

  movementsDates: [
    '2019-11-18T21:31:17.178Z',
    '2019-12-23T07:42:02.383Z',
    '2020-01-28T09:15:04.904Z',
    '2020-04-01T10:17:24.185Z',
    '2020-05-08T14:11:59.604Z',
    '2021-08-17T17:01:17.194Z',
    '2021-08-20T23:36:17.929Z',
    '2021-08-21T10:51:36.790Z',
  ],
  currency: 'EUR',
  locale: 'pt-PT', // de-DE
};

const account2 = {
  owner: 'Jessica Davis',
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,

  movementsDates: [
    '2019-11-01T13:15:33.035Z',
    '2019-11-30T09:48:16.867Z',
    '2019-12-25T06:04:23.907Z',
    '2020-01-25T14:18:46.235Z',
    '2020-02-05T16:33:06.386Z',
    '2020-04-10T14:43:26.374Z',
    '2020-06-25T18:49:59.371Z',
    '2020-07-26T12:01:20.894Z',
  ],
  currency: 'USD',
  locale: 'en-US',
};

const accounts = [account1, account2];

// Elements
const labelWelcome = document.querySelector('.welcome');
const labelDate = document.querySelector('.date');
const labelBalance = document.querySelector('.balance__value');
const labelSumIn = document.querySelector('.summary__value--in');
const labelSumOut = document.querySelector('.summary__value--out');
const labelSumInterest = document.querySelector('.summary__value--interest');
const labelTimer = document.querySelector('.timer');

const containerApp = document.querySelector('.app');
const containerMovements = document.querySelector('.movements');

const btnLogin = document.querySelector('.login__btn');
const btnTransfer = document.querySelector('.form__btn--transfer');
const btnLoan = document.querySelector('.form__btn--loan');
const btnClose = document.querySelector('.form__btn--close');
const btnSort = document.querySelector('.btn--sort');

const inputLoginUsername = document.querySelector('.login__input--user');
const inputLoginPin = document.querySelector('.login__input--pin');
const inputTransferTo = document.querySelector('.form__input--to');
const inputTransferAmount = document.querySelector('.form__input--amount');
const inputLoanAmount = document.querySelector('.form__input--loan-amount');
const inputCloseUsername = document.querySelector('.form__input--user');
const inputClosePin = document.querySelector('.form__input--pin');

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// LECTURES

const currencies = new Map([
  ['USD', 'United States dollar'],
  ['EUR', 'Euro'],
  ['GBP', 'Pound sterling'],
]);

const movements = [200, 450, -400, 3000, -650, -130, 70, 1300];

/////////////////////////////////////////////////
//Functions 

//Date Stuff
function formatCur(value, locale, currency){
  return new Intl.NumberFormat(locale, {
    style : 'currency',
    currency : currency
  }).format(value);
}

function formatMovementDates(date, locale){
  const  calcDaysPassed = (date1, date2) => Math.round(Math.abs((date2 - date1) / (1000 * 60 * 60 * 24)));

  const daysPassed = calcDaysPassed(new Date(), date);

  if (daysPassed === 0) return "Today";
  if (daysPassed === 1) return "Yesterday";
  if (daysPassed <= 7) return `${daysPassed} days ago`;

  // const year = date.getFullYear();
  // const month = `${date.getMonth() + 1}`.padStart(2, 0);
  // const day = `${date.getDate()}`.padStart(2, 0);
  return new Intl.DateTimeFormat(locale).format(date);
}

//Displaying Movements UI
function displayMovements(acc, sort = false){
  containerMovements.innerHTML = '';
  //Shoud we sort the movements or not ?
  const movs = sort ? acc.movements.slice().sort((a,b) => a - b) : acc.movements;

  movs.forEach(function(mov, i){
    const type = mov > 0 ? 'deposit' : 'withdrawal'

    const date = new Date(acc.movementsDates[i]);
    let currentDate = formatMovementDates(date, acc.locale); 

    const HTML = `<div class="movements__row">
    <div class="movements__type movements__type--${type}">${i + 1} ${type}</div>
    <div class="movements__date">${currentDate}</div>
    <div class="movements__value">${formatCur(mov, acc.locale, acc.currency)}</div>
  </div>`
    containerMovements.insertAdjacentHTML('afterbegin', HTML);
  })
}
//Calaculating User Balances
function calcBalanceMovements(acc){
  acc.balance = acc.movements.reduce(function(acc, curr, i , arr){
    return acc + curr;
  } ,0)
  labelBalance.textContent = `${formatCur(acc.balance, acc.locale, acc.currency)}`;
}

//Creating User Names & joining them to objects
function createUsernames(accs){
  accs.forEach(function(acc){
    acc.username = acc.owner.toLowerCase().split(' ').map(function(word){
      return word[0];
    }).join('');
  })
}

// Calculating and Displaying Summary 
function calcDisplaySummary(account){
  const income = account.movements.filter(mov => mov > 0)
  .reduce((acc, mov) => acc + mov , 0);
  labelSumIn.textContent = `${formatCur(income, account.locale, account.currency)}`;
  const outcome = Math.abs(account.movements.filter(mov => mov < 0)
  .reduce((acc, mov) => acc + mov, 0));
  labelSumOut.textContent = `${formatCur(outcome, account.locale, account.currency)}`;
  const interest = account.movements.filter(mov => mov > 0)
  .map(inc => inc * account.interestRate/100)
  .reduce((acc, int) => acc + int , 0);
  labelSumInterest.textContent = `${formatCur(interest, account.locale, account.currency)}`;
}

function updateUI(acc){
  displayMovements(acc);
  calcBalanceMovements(acc);
  calcDisplaySummary(acc);
}

createUsernames(accounts);

// Login 
let currentAccount;

// Fake Login
currentAccount = account1;
updateUI(currentAccount);
containerApp.style.opacity = 100;

btnLogin.addEventListener('click', function(e){
  // Prevent form from submitting
  e.preventDefault();
  
  currentAccount = accounts.find(acc => acc.username === inputLoginUsername.value);

  //Checking Pin (Used Chaining to check if currentAccount exists or NO)
  if(currentAccount?.pin === Number(inputLoginPin.value)){
    //Display UI & message
    labelWelcome.textContent = `Welcome Back, ${currentAccount.owner.split(' ')[0]}`;
    containerApp.style.opacity = 100;
    //Creating & Displaying Date
    const now = new Date();
    const options = {
      hour : 'numeric',
      minute : 'numeric',
      day : '2-digit',
      month : 'long',
      year : 'numeric',
      weekday : 'long'

    }
    // const year = now.getFullYear();
    // const month = `${now.getMonth() + 1}`.padStart(2, 0);
    // const day = `${now.getDate()}`.padStart(2, 0);
    // const hour = `${now.getHours()}`.padStart(2, 0);
    // const min = `${now.getMinutes()}`.padStart(2, 0);
    labelDate.textContent = new Intl.DateTimeFormat(currentAccount.locale, options).format(now);
    //Clear input fields
    inputLoginUsername.value = inputLoginPin.value = '';
    inputLoginPin.blur();
    //Display UI
    updateUI(currentAccount);
  }
})

//Date


//Transfer Money
btnTransfer.addEventListener('click', function(e){
  // Prevent form from submitting
  e.preventDefault();

  const amount = Number(inputTransferAmount.value);
  const receiver = accounts.find(acc => acc.username === inputTransferTo.value);
  console.log(amount, receiver);
  //Clear input fields
  inputTransferAmount.value = inputTransferTo.value = '';
  // Check if Transfer is valid
  if (amount > 0 && receiver && receiver.username !== currentAccount.username && currentAccount.balance >= amount){
    currentAccount.movements.push(-amount);
    receiver.movements.push(amount);

    //Add Date
    currentAccount.movementsDates.push(new Date().toISOString());
    receiver.movementsDates.push(new Date().toISOString());
    updateUI(currentAccount);
  }
})

//Loan
// Our Bank has a rule,Which says we will give you loan only if there is atleast one deposit with atleast 10% of requested loan amount
btnLoan.addEventListener('click', function(e){
  // Prevent form from submitting
  e.preventDefault();

  const amount = Number(inputLoanAmount.value);
  inputLoanAmount.value = '';
  if (amount > 0 && currentAccount.movements.some(mov => mov >= amount * 0.1)){
    //Add movement
    currentAccount.movements.push(amount);

    //Add Date
    currentAccount.movementsDates.push(new Date().toISOString());
    updateUI(currentAccount);
  }
})

//Close Account
btnClose.addEventListener('click', function(e){
  // Prevent form from submitting
  e.preventDefault();

  const enteredUser = accounts.find(acc => acc.username === inputCloseUsername.value);
  const enteredPin = Number(inputClosePin.value);
  //Clear input fields
  inputCloseUsername.value = inputClosePin.value = '';
  // Check if inputs are correct
  if (currentAccount.username === enteredUser.username && enteredPin === currentAccount.pin ){
    const index = accounts.findIndex(acc => acc.username === currentAccount.username);
    // Delete Account
    accounts.splice(index , 1);
    // Hide UI
    containerApp.style.opacity = 0;
  }
})

//Sort
let sorted = false;
btnSort.addEventListener('click', function(e){
  // Prevent form from submitting
  e.preventDefault();

  displayMovements(currentAccount.movements, !sorted);
  //flip sorted var
  sorted = !sorted;
})