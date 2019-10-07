// BUDGET CONTROLLER
var budgetController = (function() {
  var Expense = function(id, desc, value) {
    this.id = id;
    this.desc = desc;
    this.value = value;
    this.percentage = -1;
  };
  Expense.prototype.calcPercentage = function(totlaIncome) {
    if (totlaIncome > 0) {
      this.percentage = Math.round((this.value / totlaIncome) * 100);
    } else {
      this.percentage = -1;
    }
  };

  Expense.prototype.getPercentage = function() {
    return this.percentage;
  };
  var Income = function(id, desc, value) {
    this.id = id;
    this.desc = desc;
    this.value = value;
  };

  var calculateTotal = function(type) {
    var sum = 0;
    data.allItmes[type].forEach(function(current) {
      sum = sum + current.value;
    });
    data.totals[type] = sum;
  };

  var data = {
    allItmes: {
      exp: [],
      inc: []
    },
    totals: {
      exp: 0,
      inc: 0
    },
    budget: 0,
    percentage: -1
  };
  return {
    addItem: function(type, des, val) {
      var newItem, ID;
      // [1 2 3 4 5], next ID=6
      // [1 2 4 6 8], next ID=9
      // ID= last ID +1

      //create new item based on 'inc' or 'exp' type
      if (data.allItmes[type].length > 0) {
        //coz first id=0
        ID = data.allItmes[type][data.allItmes[type].length - 1].id + 1;
      } else {
        ID = 0;
      }
      if (type === "exp") {
        newItem = new Expense(ID, des, val);
      } else if (type === "inc") {
        newItem = new Income(ID, des, val);
      }
      // push it into our data structure
      data.allItmes[type].push(newItem);
      // return the new element
      return newItem;
    },

    deleteItem: function(type, id) {
      var ids, index;
      // id=3
      // data.allItems[type][id];
      // ids=[1 2 4 6 8]
      // index=3
      ids = data.allItmes[type].map(function(current) {
        //map returns a new array
        return current.id;
      });

      index = ids.indexOf(id);
      if (index !== -1) {
        data.allItmes[type].splice(index, 1); //start from num and delete given number of elements
      }
    },
    calculateBudget: function() {
      // calculate total inc and exp
      calculateTotal("exp");
      calculateTotal("inc");
      // calculate the budget : inc - exp
      data.budget = data.totals.inc - data.totals.exp;
      // calculate the % of income that we spent
      if (data.totals.inc > 0) {
        data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
      } else {
        data.percentage = -1;
      }
    },

    calculatePercentages: function() {
      // a=20
      // b=10
      // c=40
      // income=100
      // a=20/100=20%
      data.allItmes.exp.forEach(function(cur) {
        cur.calcPercentage(data.totals.inc);
      });
    },

    getPercentages: function() {
      var allPercentage = data.allItmes.exp.map(function(cur) {
        return cur.getPercentage();
      });
      return allPercentage;
    },

    getBudget: function() {
      return {
        budget: data.budget,
        totlaIncome: data.totals.inc,
        totalExpenses: data.totals.exp,
        percentage: data.percentage
      };
    },
    testing: function() {
      console.log(data);
    }
  };
})();

// UI CONTROOLER
var UIControoler = (function() {
  // some code
  var DOMstrings = {
    inputType: ".add__type",
    inputDesc: ".add__description",
    inputValue: ".add__value",
    inputBtn: ".add__btn",
    incomeContainer: ".income__list",
    expensesContainer: ".expenses__list",
    budgetLabel: ".budget__value",
    incomeLabel: ".budget__income--value",
    expenseLabel: ".budget__expenses--value",
    percentageLabel: ".budget__expenses--percentage",
    container: ".container",
    expensesPercLabel:".item__percentage",
      dateLabel:".budget__title--month"
  };
   var formateNumber= function(num, type) {
        var numSplit, int, dec;
        /*
        + or - before number
        exactly 2 decimal points
        comma separating thousands
        */
        num = Math.abs(num);
        num = num.toFixed(2);
        numSplit = num.split('.');
        int = numSplit[0];
        if (int.length > 3) {
            int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, 3);
        }
        dec = numSplit[1];

       ;

       return (type === 'exp' ? '-' : '+')+ ' ' + int +'.'+ dec;
    };
    var nodeListForEach = function (list, callback) {
        for (var i = 0; i < list.length; i++) {
            callback(list[i], i);
        }
    };
  return {
    getInput: function() {
      return {
        type: document.querySelector(DOMstrings.inputType).value, // will return inc or exp
        description: document.querySelector(DOMstrings.inputDesc).value,
        value: parseFloat(document.querySelector(DOMstrings.inputValue).value) //parseFloat convert string to float
      };
    },
    addListItems: function(obj, type) {
      var html, newHtml, element;
      //create html string with placeholder text
      if (type === "inc") {
        element = DOMstrings.incomeContainer;

        html =
          '<div class="item clearfix" id="inc-%id%"> <div class="item__description">%description%</div> <div class="right clearfix"> <div class="item__value">%value%</div> <div class="item__delete"> <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button> </div> </div> </div>';
      } else if (type === "exp") {
        element = DOMstrings.expensesContainer;
        html =
          '<div class="item clearfix" id="exp-%id%"> <div class="item__description">%description%</div> <div class="right clearfix"> <div class="item__value">%value%</div> <div class="item__percentage">21%</div> <div class="item__delete"> <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button> </div> </div> </div>';
      }

      // replace placeholder text with actual data
      newHtml = html.replace("%id%", obj.id);
      newHtml = newHtml.replace("%description%", obj.desc);
        newHtml = newHtml.replace("%value%", formateNumber(obj.value,type));
      // insert html into the DOM
      document.querySelector(element).insertAdjacentHTML("beforeend", newHtml);
    },
    deleteListItem: function(selectedId) {
      var el = document.getElementById(selectedId);
      el.parentNode.removeChild(el);
    },
    clearFields: function() {
      var fields, fieldsArray;
      fields = document.querySelectorAll(
        DOMstrings.inputDesc + "," + DOMstrings.inputValue
      ); // it returns a list, we will convert to array
      fieldsArray = Array.prototype.slice.call(fields);

      Array.prototype.forEach.call(fieldsArray, function(
        current,
        index,
        array
      ) {
        // Write your code here
        current.value = "";
      });
      // fieldsArray.foreach(function(current,index,array){//this func can recieve upto three arguments
      //     current.value="";
      // });
      fieldsArray[0].focus();
    },
    displayBudget: function(obj) {
        var type;
        obj.budget > 0 ? type='inc' : type='exp';
        document.querySelector(DOMstrings.budgetLabel).textContent = formateNumber(obj.budget,type) ;
      document.querySelector(DOMstrings.incomeLabel).textContent =
          formateNumber(obj.totlaIncome,'inc') ;
      document.querySelector(DOMstrings.expenseLabel).textContent =
          formateNumber(obj.totalExpenses,'exp') ;
      document.querySelector(DOMstrings.percentageLabel).textContent =
        obj.percentage + "%";

      if (obj.percentage > 0) {
        document.querySelector(DOMstrings.percentageLabel).textContent =
          obj.percentage + "%";
      } else {
        document.querySelector(DOMstrings.percentageLabel).textContent = "----";
      }
    },

    displayPercentages:function(percentage){
        var fields=document.querySelectorAll(DOMstrings.expensesPercLabel); 
        nodeListForEach(fields, function(current,index){
            if(percentage[index]>0){
                current.textContent=percentage[index]+'%';
            }else{
                current.textContent='---';
            }
        });
    },

    displayMonth:function(){
        var now,year,month,months;
        now=new Date();
        year=now.getFullYear();
        months=['January','February','March','April','May','June','July','August','September','October','November','December'];
        month=now.getMonth();
        document.querySelector(DOMstrings.dateLabel).textContent=months[month]+' '+year;
    },


    changeType:function(){
        var fields=document.querySelectorAll(
            DOMstrings.inputType +','+
            DOMstrings.inputDesc +','+
            DOMstrings.inputValue
        );
        nodeListForEach(fields,function(cur){
            cur.classList.toggle('red-focus'); 
        });
        document.querySelector(DOMstrings.inputBtn).classList.toggle('red');
    },



    getDOMstrings: function() {
      return DOMstrings;
    }
  };
})();

// APP CONTROOLER
var controller = (function(budgetController, UIControoler) {
  // some code
  var setupEventListners = function() {
    var DOM = UIControoler.getDOMstrings();
    document.querySelector(DOM.inputBtn).addEventListener("click", ctrlAddItme);

    document.addEventListener("keypress", function(e) {
      if (e.keyCode === 13 || e.which === 13) {
        ctrlAddItme();
      }
    });
    document
      .querySelector(DOM.container)
      .addEventListener("click", ctrlDeleteItem);

      document.querySelector(DOM.inputType).addEventListener('change',UIControoler.changeType);
  };

  updatePercentage = function() {
    var percentage;
    //1.calculate %
    budgetController.calculatePercentages();
    //2. read % from the budget controller
    percentage = budgetController.getPercentages();
    //3.update the UI with new %
    UIControoler.displayPercentages(percentage);
  };

  var updateBudget = function() {
    // 1. calculate the budget
    budgetController.calculateBudget();
    // 2.return budget
    var budget = budgetController.getBudget();
    // 3. display the budget on ui
    UIControoler.displayBudget(budget);
  };
  var ctrlAddItme = function() {
    var input, newItem;
    //1. get the fieled input data
    var input = UIControoler.getInput();

    if (input.description !== "" && !isNaN(input.value) && input.value > 0) {
      // 2.Add the item to the budget controller
      newItem = budgetController.addItem(
        input.type,
        input.description,
        input.value
      );
      // 3.add the item to the ui
      UIControoler.addListItems(newItem, input.type);
      // 4.clear the fields
      UIControoler.clearFields();
      // 5.calculate and update budget
      updateBudget();
      // 6. update %
      updatePercentage();
    }
  };

  var ctrlDeleteItem = function(event) {
    var itemID, splitID, type, id;
    itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
    console.log(itemID);
    if (itemID) {
      //   inc-1
      splitID = itemID.split("-");
      type = splitID[0];
      id = parseInt(splitID[1]);

      // 1.delete the itme from data structure
      budgetController.deleteItem(type, id);
      // 2.delete the itme from UI
      UIControoler.deleteListItem(itemID);
      // 3.update and show the new budget
      updateBudget();
      //   4.update %
      updatePercentage();
    }
  };
  return {
    init: function() {
        UIControoler.displayMonth();
      console.log("application has started");
      UIControoler.displayBudget({
        budget: 0,
        totlaIncome: 0,
        totalExpenses: 0,
        percentage: -1
      });
      setupEventListners();

    }
  };
})(budgetController, UIControoler);

controller.init();
