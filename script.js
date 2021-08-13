'use strict';

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// BANKIST APP

// Data
const account1 = {
  owner: 'Jonas Schmedtmann',
  movements: [200, 450, -400, 3000, -650, -130, 70, 1300],
  interestRate: 1.2, // %
  pin: 1111,
};

const account2 = {
  owner: 'Jessica Davis',
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,
};

const account3 = {
  owner: 'Steven Thomas Williams',
  movements: [200, -200, 340, -300, -20, 50, 400, -460],
  interestRate: 0.7,
  pin: 3333,
};

const account4 = {
  owner: 'Sarah Smith',
  movements: [430, 1000, 700, 50, 90],
  interestRate: 1,
  pin: 4444,
};

const accounts = [account1, account2, account3, account4];

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
//Displaying Movements UI
function displayMovements(movements){
  containerMovements.innerHTML = '';

  movements.forEach(function(mov, i){
    const type = mov > 0 ? 'deposit' : 'withdrawal'
    const HTML = `<div class="movements__row">
    <div class="movements__type movements__type--${type}">${i + 1} ${type}</div>
    <div class="movements__value">${mov}€</div>
  </div>`
    containerMovements.insertAdjacentHTML('afterbegin', HTML);
  })
}
//Calaculating User Balances
function calcBalanceMovements(acc){
  acc.balance = acc.movements.reduce(function(acc, curr, i , arr){
    return acc + curr;
  } ,0)
  labelBalance.textContent = `${acc.balance}€`;
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
  labelSumIn.textContent = `${income}€`;
  const outcome = Math.abs(account.movements.filter(mov => mov < 0)
  .reduce((acc, mov) => acc + mov, 0));
  labelSumOut.textContent = `${outcome}€`;
  const interest = account.movements.filter(mov => mov > 0)
  .map(inc => inc * account.interestRate/100)
  .reduce((acc, int) => acc + int , 0);
  labelSumInterest.textContent = `${interest}€`;
}

function updateUI(acc){
  displayMovements(acc.movements);
  calcBalanceMovements(acc);
  calcDisplaySummary(acc);
}

createUsernames(accounts);

// Login 
let currentAccount;

btnLogin.addEventListener('click', function(e){
  // Prevent form from submitting
  e.preventDefault();
  
  currentAccount = accounts.find(acc => acc.username === inputLoginUsername.value);

  //Checking Pin (Used Chaining to check if currentAccount exists or NO)
  if(currentAccount?.pin === Number(inputLoginPin.value)){
    //Display UI & message
    labelWelcome.textContent = `Welcome Back, ${currentAccount.owner.split(' ')[0]}`;
    containerApp.style.opacity = 100;
    //Clear input fields
    inputLoginUsername.value = inputLoginPin.value = '';
    inputLoginPin.blur();
    //Display UI
    updateUI(currentAccount);
  }
})

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



