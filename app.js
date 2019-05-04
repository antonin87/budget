const budgetController = (() => {

    const Expense = function(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    };

    Expense.prototype.calcPercentage = function(totalIncome) {
        if (totalIncome > 0) {
            this.percentage = Math.round((this.value / totalIncome) * 100);
        } else {
            this.percentage = -1;
        }
    }

    Expense.prototype.getPercentage = function() {
        return this.percentage;
    }

    const Income = function(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    };

    const calculateTotal = (type) => {
        let sum = 0;
        data.allItems[type].forEach(function(total){
            sum += total.value;
        })
        data.totals[type] = sum;
    }
   
    const data = {
        allItems: {
            exp: [],
            inc: [],
        },
        totals: {
            exp: 0,
            inc: 0
        },
        budget: 0,
        percentage: -1
    }

        return {
            addItem : (type, des, val) => {
                let newItem, ID;
                ID = data.allItems[type].length > 0 ? data.allItems[type][data.allItems[type].length - 1].id + 1 : 0;
                if (type === 'exp') {
                    newItem = new Expense(ID, des, val);
                } else if (type === 'inc') {
                    newItem = new Income(ID, des, val);
                }
                data.allItems[type].push(newItem);

                return newItem;
            },

            deleteItem: (type, id) => {
                const ids = data.allItems[type].map(item => {
                    return item.id;
                })
                const index = ids.indexOf(parseInt(id));
               
                if (index !== -1) {
                    data.allItems[type].splice(index, 1);
                }
            },

            calculateBudget: () => {
                calculateTotal('exp');
                calculateTotal('inc');
                data.budget = data.totals.inc - data.totals.exp;
                if (data.totals.inc > 0) {
                    data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
                } else {
                    data.percentage = -1;
                }            
                
            },

            calculatePercentage: () => {
                data.allItems['exp'].forEach(function(cur) {
                    cur.calcPercentage(data.totals.inc);
                });
            },

            getPercentages: function() {
                const allPercentage = data.allItems['exp'].map(cur => cur.getPercentage());
                return allPercentage;
            },

            getBudget: () => {
                return {
                    budget: data.budget,
                    totalInc: data.totals.inc,
                    totalExp: data.totals.exp,
                    percentage: data.percentage
                }
            }

        }

})();

const UIController = (() => {

    const DOMstrings = {
        inputType : '.add__type',
        inputDescription : '.add__description',
        inputValue : '.add__value',
        inputBtn: '.add__btn',
        incomeContainer: '.income__list',
        expensesContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expensesLabel: '.budget__expenses--value',
        percentageLabel: '.budget__expenses--percentage',
        container: '.container',
        expensesPercLabel: '.item__percentage',
        dateLabel: '.budget__title--month'
    };

    const formatNumber = (num, type) => {
        let numSplit, int, dec;

        num = Math.abs(num);
        num = num.toFixed(2);
        numSplit = num.split('.');
        int = numSplit[0];
        if (int.length > 3) {
            int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, int.length);
        }
        dec = numSplit[1];
        return (type === 'exp' ? '-' : '+') + int + '.' + dec;
    };

    const nodeListForEach = (list, callback) => {
        for (let i = 0; i < list.length; i++) {
            callback(list[i], i);
        }
    };

    return {
        getInput: () => {
            return {
                type: document.querySelector(DOMstrings.inputType).value,
                description: document.querySelector(DOMstrings.inputDescription).value,
                value: parseFloat(document.querySelector(DOMstrings.inputValue).value)
            }
        },

        addListItem: (obj, type) => {
            let html, newHTML, element;
            if (type === 'inc') {
                element = DOMstrings.incomeContainer;
                html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div>'
                +'<div class="right clearfix">'+
                '<div class="item__value">%value%</div>'
                    +'<div class="item__delete">'
                        +'<button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button>'
                    +'</div>'
                +'</div>'
            +'</div>';
            } else if (type === 'exp') {
                element = DOMstrings.expensesContainer;
                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div>'
                +'<div class="right clearfix">'+
                '<div class="item__value">%value%</div>'
                +'<div class="item__percentage">21%</div>'
                    +'<div class="item__delete">'
                        +'<button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button>'
                    +'</div>'
                +'</div>'
            +'</div>';
            }

            newHTML = html.replace('%id%', obj.id);
            newHTML = newHTML.replace('%description%', obj.description);
            newHTML = newHTML.replace('%value%', formatNumber(obj.value, type));
            document.querySelector(element).insertAdjacentHTML('beforeend', newHTML);
        },

        deleteItem : (selectorID) => {
            const el = document.getElementById(selectorID);
            el.parentNode.removeChild(el);
        },

        displayBudget: function(obj) {
            const type = obj.budget > 0 ? 'inc' : 'exp';
             document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(obj.budget, type);
            document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(obj.totalInc, type);
            document.querySelector(DOMstrings.expensesLabel).textContent = formatNumber(obj.totalExp, type);
            
            if (obj.percentage > 0) {
                document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + '%';
            } else {
                document.querySelector(DOMstrings.percentageLabel).textContent = '---';
            }
        },

        displayPercentage: (percentages) => {
            const fields = document.querySelectorAll(DOMstrings.expensesPercLabel);
            nodeListForEach(fields, (current, index) => {
                if (percentages[index] > 0) {
                    current.textContent = percentages[index] + '%';
                } else {
                    current.textContent = '---';
                }
            });
        },

        clearFields: () => {
            let fields;   
            fields = document.querySelectorAll(DOMstrings.inputDescription + ', '+ DOMstrings.inputValue);
            fieldsArr = Array.prototype.slice.call(fields);
            fields.forEach((current) => {
                current.value = '';
            });
            fieldsArr[0].focus();
        },

        displayMonth: () => {
            let now, months, month, year;
            now = new Date();
            months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
            month = now.getMonth();
            year = now.getFullYear();
            document.querySelector(DOMstrings.dateLabel).textContent = months[month] + ' ' + year;
        },

        changedType: function() {
            
            const fields = document.querySelectorAll(
                DOMstrings.inputType + ',' +
                DOMstrings.inputDescription + ',' +
                DOMstrings.inputValue);
            
            nodeListForEach(fields, (cur) => {
               cur.classList.toggle('red-focus'); 
            });
            
            document.querySelector(DOMstrings.inputBtn).classList.toggle('red');
            
        },

        getDOMstrings: () => {
            return DOMstrings;
        }
    }
})();


const controller = ((budgetCtrl, UICtrl) => {

    const setupEventListeners = () => {
        const DOM = UICtrl.getDOMstrings();
        document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);
        document.addEventListener('keypress', function(event) {
            if (event.keyCode === 13 || event.which === 13) {
               ctrlAddItem();
            }
        });
        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);
        document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changedType);
    };

    const updateBudget = () => {
        budgetCtrl.calculateBudget();
        //5 Display the budget on the UI
        const budget = budgetCtrl.getBudget();
        UICtrl.displayBudget(budget);
    };
    
    const updatePercentage = () => {
        budgetCtrl.calculatePercentage();
        const percentages = budgetCtrl.getPercentages();
        UICtrl.displayPercentage(percentages);
    };

    const ctrlAddItem = () => {
        let input, newItem;
        //1. Get the gilled input data
        input = UICtrl.getInput();
        if (input.description !== '' && !isNaN(input.value) && input.value > 0) {
        //2 Add the item to the budgetController
        newItem = budgetCtrl.addItem(input.type, input.description, input.value);
        //3 add the item to the UI
        UICtrl.addListItem(newItem, input.type);
        UICtrl.clearFields();
        updateBudget();
        updatePercentage();
        }
     }

     const ctrlDeleteItem = (event) => {
        let itemID, splitID, type, id;

        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
        if (itemID) {
            splitID = itemID.split('-');
            type = splitID[0];
            id = splitID[1];
        }
        budgetCtrl.deleteItem(type,id);
        UICtrl.deleteItem(itemID);
        updateBudget();
        updatePercentage();
     }

     return {
         init: () => {
             console.log('Application has been started');
             UICtrl.displayMonth();
             UICtrl.displayBudget({
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                percentage: -1
            });
             setupEventListeners();
         }
     }
})(budgetController, UIController);

controller.init();