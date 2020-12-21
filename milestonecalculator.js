module.exports = {
    CalculateMilestones: function (cardBalanceSchedule, savingsGoal) {
        var incomes = CalculateIncomes(cardBalanceSchedule);
        var totalIncomeAmount = CalculateTotalIncomeAmount(incomes)
        var percentageOfIncomeToMilestone = (savingsGoal[0].EndAmount - savingsGoal[0].StartAmount) / totalIncomeAmount;
        var milestones = CalculateIndividualMilestones(incomes, percentageOfIncomeToMilestone);

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

function CalculateIncomes(cardBalanceSchedule) {
    var incomes = [];
    cardBalanceSchedule.forEach(element => {
        if (element.IsIncome) {
            incomes.push(element);
        }
    });
    return incomes;
}

function CalculateTotalIncomeAmount(incomes) {
    var totalIncomeAmount = 0.00;
    incomes.forEach(element => {
        totalIncomeAmount = totalIncomeAmount + element.CardBalance
    });
    return totalIncomeAmount;
}

function CalculateIndividualMilestones(incomes, percentageOfIncomeToMilestone) {
    var milestones = [];
    incomes.forEach(element => {
        var newObject = {
            Date: element.Date,
            Amount: (Math.round(element.CardBalance * percentageOfIncomeToMilestone))
        }
        milestones.push(newObject);
    });
    return milestones;
}