module.exports = {
    CalculateMilestones: function (cardBalanceSchedule, savingsGoal) {
        var incomes = CalculateIncomes(cardBalanceSchedule, savingsGoal);
        var maximumIncomeAmount = CalculateMaximumIncomeAmount(incomes);
        var percentageOfIncomeToMilestone = (savingsGoal[0].EndAmount - savingsGoal[0].StartAmount) / maximumIncomeAmount;
        var milestones = CalculateIndividualMilestones(incomes, percentageOfIncomeToMilestone, savingsGoal);

        cardBalanceSchedule.forEach(element => {
            var result = milestones.filter(obj => {
                return obj.Date === element.Date;
            });
            if (result.length > 0) {
                element.MilestoneAmount = result[0].Amount;
            }
        });
    }
}

function CalculateIncomes(cardBalanceSchedule, savingsGoal) {
    var incomes = [];
    for (var i = 0; i < cardBalanceSchedule.length; i++) {
        if (i > 0) {
            if (cardBalanceSchedule[i].IsIncome
                && (new Date(cardBalanceSchedule[i].Date) >= new Date(savingsGoal[0].StartDate))
                && (new Date(cardBalanceSchedule[i].Date) <= new Date(savingsGoal[0].EndDate))) {
                cardBalanceSchedule[i].IncomeAmount = cardBalanceSchedule[i].CardBalance - cardBalanceSchedule[i - 1].CardBalance;
                incomes.push(cardBalanceSchedule[i]);
            }
        }
    }
    return incomes;
}

function CalculateMaximumIncomeAmount(incomes) {
    var totalIncomeAmount = 0.00;
    incomes.forEach(element => {
        totalIncomeAmount = totalIncomeAmount + element.IncomeAmount;
    });
    return totalIncomeAmount;
}

function CalculateIndividualMilestones(incomes, percentageOfIncomeToMilestone, savingsGoal) {
    var milestones = [{
        Date: savingsGoal[0].StartDate,
        Amount: savingsGoal[0].StartAmount
    }];

    var previousMilestone = savingsGoal[0].StartAmount;
    incomes.forEach(element => {
        var newObject = {
            Date: element.Date,
            Amount: (Math.round(element.IncomeAmount * percentageOfIncomeToMilestone))
        };
        newObject.Amount = newObject.Amount + previousMilestone;
        previousMilestone = newObject.Amount;
        milestones.push(newObject);
    });
    milestones[milestones.length - 1].Amount = savingsGoal[0].EndAmount;
    return milestones;
}
