function formatCurrency(value) {
    if (isNaN(value)) {
        return value;
    }
    return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

let cashFlowData = JSON.parse(localStorage.getItem("cashFlow")) || []

//Goal data
let dataGoalText = JSON.parse(localStorage.getItem("goalDataText")) || [];
let dataGoalPrice = JSON.parse(localStorage.getItem("goalDataPrice")) || [];

//Modal set goal
let setGoalModal = new bootstrap.Modal(document.getElementById('setGoalModal'));

//Warning modal
let warningModal = new bootstrap.Modal(document.getElementById("warningModal"));

//Delete confirmation modal
let deleteModal = new bootstrap.Modal(document.getElementById("deleteConfirmationModal"))


//Save cash modal 
let saveCashModal = new bootstrap.Modal(document.getElementById("saveCashModal"))

//Clear all confirmation modal
let clearAllModal = new bootstrap.Modal(document.getElementById("deleteAllConfirmation"))

let moneyFlowList = document.getElementById("moneyFlowList")

let progressBarDiv = document.getElementById("progressBar")


function showSetGoalModal() {
    setGoalModal.show();
}

function goalDataShow() {
    let goalText = document.getElementById("goalText")
    let goalPrice = document.getElementById("goalPrice")

    if (dataGoalText.length === 0 && dataGoalPrice.length === 0) {
        goalText.innerText = "No Goal"
        goalPrice.innerText = "-"
    } else {
        goalText.innerText = dataGoalText
        goalPrice.innerText = formatCurrency(dataGoalPrice)
    }
}

goalDataShow()

function totalAmount() {
    let totalAmountShow = document.getElementById("totalAmount")
    let totalAmount = cashFlowData.reduce((acc, cash) => acc + cash.amount, 0)

    if (totalAmount === 0) {
        totalAmountShow.innerText = "-"
    } else {
        totalAmountShow.innerText = formatCurrency(totalAmount)
    }
}

totalAmount()

function amountRemaining() {
    let amountText = document.getElementById("amount")

    let totalAmount = cashFlowData.reduce((acc, cash) => acc + cash.amount, 0)
    let totalRemaining = dataGoalPrice - totalAmount

    if (totalRemaining < 0) {
        amountText.innerText = 0
    } else {
        amountText.innerText = formatCurrency(totalRemaining)
    }
}

amountRemaining()

function progressBar() {
    progressBarDiv.innerHTML = ""
    let barProgress = document.createElement("div")

    let totalAmount = cashFlowData.reduce((acc, cash) => acc + cash.amount, 0)

    let progress = 0
    if (dataGoalPrice.length === 0) {
        progress = 0
    } else {
        progress = Math.round((totalAmount / dataGoalPrice) * 100)
    }


    barProgress.innerHTML = `
    <div class="d-flex justify-content-center">
        <p class="progress-title fw-bolder">Goal Progress</p>
    </div>
    <div class="progress" style="height: 20px;">
        <div class="progress-bar" role="progressbar" style="width: ${progress}%;" aria-valuenow="30"
            aria-valuemin="0" aria-valuemax="100">
            ${progress}%
        </div>
    </div>
    `

    progressBarDiv.appendChild(barProgress)
}

progressBar()

function btnModal() {
    let setGoalText = document.getElementById("setGoalText")
    let setGoalPrice = document.getElementById("setGoalPrice")

    let goalTextValue = setGoalText.value
    let goalPriceValue = setGoalPrice.value

    if (goalTextValue.trim() === "" && goalPriceValue.trim() === "") {
        setGoalModal.hide()
        warningModal.show()
        return
    } else if (goalTextValue.trim() === "" || goalPriceValue.trim() === "") {
        setGoalModal.hide()
        warningModal.show()
        return
    }

    if (dataGoalText.length > 0) {
        alert("Goal sudah ada")
        return
    }

    dataGoalText.push(goalTextValue)
    dataGoalPrice.push(goalPriceValue)

    localStorage.setItem("goalDataText", JSON.stringify(goalTextValue))
    localStorage.setItem("goalDataPrice", goalPriceValue)
    setGoalText.value = ""
    setGoalPrice.value = ""
    setGoalModal.hide();
    goalDataShow()
    amountRemaining()
    progressBar()
}

function deleteConfirmation() {
    deleteModal.show()
}

function deleteGoal() {
    if (dataGoalText.length > 0) {

        localStorage.removeItem("goalDataText")
        localStorage.removeItem("goalDataPrice")

        deleteModal.hide();
        window.location.reload()
    } else {
        deleteModal.hide();
        alert("No goal to delete");
    }
}

function saveMoneyFlow() {
    moneyFlowList.innerHTML = ""

    if (cashFlowData.length === 0) {
        let moneyFlow = document.createElement("div");
        moneyFlow.innerHTML = `<h6 class="text-center text-secondary">No data</h6>`;
        moneyFlowList.appendChild(moneyFlow);
        return;
    }

    cashFlowData.slice().reverse().forEach(transaction => {
        let moneyFlow = document.createElement("div");

        moneyFlow.innerHTML = `
            <div class="card shadow-sm mb-2">
                <div class="card-body">
                    <div class="d-flex align-items-center justify-content-between">
                        <h6>${transaction.date}</h6>
                        <h6 class="ms-2 ${transaction.isSave ? 'text-success' : 'text-danger'}">
                            <i class="${transaction.isSave ? 'fa-solid fa-arrow-trend-up' : 'fa-solid fa-arrow-trend-down'}" style="${transaction.isSave ? 'color: #28a745;' : 'color: #dc3545;'}"></i>
                            Rp ${formatCurrency(transaction.amount)}
                        </h6>
                    </div>
                </div>
            </div>
        `;

        moneyFlowList.appendChild(moneyFlow);
    });
}

function saveCash() {
    saveCashModal.show()
}


function saveCashProses() {
    let dateToday = new Date()
    let date = dateToday.getDate()
    let monthName = dateToday.toLocaleString("en-US", { month: "long" });
    let year = dateToday.getFullYear()


    let cashAmount = document.getElementById("cashAmount")
    let cashAmountValue = cashAmount.value.trim()

    if (cashAmountValue === "") {
        alert("Please enter an amount")
        return
    }

    cashFlowData.push({
        date: `${date} ${monthName} ${year}`,
        amount: parseFloat(cashAmountValue),
        isSave: true
    })

    localStorage.setItem("cashFlow", JSON.stringify(cashFlowData))

    cashAmount.value = ""

    saveCashModal.hide()
    saveMoneyFlow()
    totalAmount()
    amountRemaining()
    progressBar()
}

saveMoneyFlow()

function clearAllPopUp() {
    clearAllModal.show()
}

function clearAllProcess() {
    let goalText = localStorage.getItem("goalDataText");
    let goalPrice = localStorage.getItem("goalDataPrice");
    let cashFlow = localStorage.getItem("cashFlow");

    if (!goalText && !goalPrice && !cashFlow) {
        alert("No data can be deleted!");
        clearAllModal.hide()
        return
    }

    localStorage.removeItem("goalDataText")
    localStorage.removeItem("goalDataPrice")
    localStorage.removeItem("cashFlow")

    window.location.reload()
}