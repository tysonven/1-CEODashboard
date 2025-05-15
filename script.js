// script.js - 1% Club Business Health Dashboard - Expanded
document.addEventListener("DOMContentLoaded", () => {
    const apiBaseUrl = "https://tysonven.pythonanywhere.com"; 
    const updateDashboardButton = document.getElementById("updateDashboard");
    // The form itself is not strictly needed for submission if we use a button click and FormData
    // const businessDataForm = document.getElementById("business-data-form"); 

    // Metric Display Elements (using IDs from index_expanded.html)
    const metricDisplayProfitEl = document.getElementById("metricDisplayProfit");
    const metricDisplayProfitMarginEl = document.getElementById("metricDisplayProfitMargin");
    const metricDisplayRevenueGrowthEl = document.getElementById("metricDisplayRevenueGrowth");
    const metricDisplayGrossProfitEl = document.getElementById("metricDisplayGrossProfit");
    const metricDisplayGrossMarginEl = document.getElementById("metricDisplayGrossMargin");
    const metricDisplayClientRetentionEl = document.getElementById("metricDisplayClientRetention");
    const metricDisplayAOVEl = document.getElementById("metricDisplayAOV");
    const metricDisplayLeadToClientEl = document.getElementById("metricDisplayLeadToClient");
    const metricDisplayCPLEl = document.getElementById("metricDisplayCPL");
    const metricDisplayMarketingROIEl = document.getElementById("metricDisplayMarketingROI");
    const metricDisplayMonthsRunwayEl = document.getElementById("metricDisplayMonthsRunway");
    const metricDisplayColdOutreachConversionEl = document.getElementById("metricDisplayColdOutreachConversion");

    // Suggestion Display Elements
    const suggestionsDisplayEl = document.getElementById("suggestionsDisplay");
    const goalSuggestionsDisplayEl = document.getElementById("goalSuggestionsDisplay");
    
    const printReportButton = document.getElementById("printReportButton");

    let charts = {}; // To store chart instances

    function getNumericValue(id) {
        const element = document.getElementById(id);
        if (!element) {
            console.warn(`Element with ID ${id} not found.`);
            return NaN; // Return NaN if element not found
        }
        const value = element.value;
        const parsedValue = parseFloat(value);
        return isNaN(parsedValue) ? null : parsedValue; // Return null if not a number, so backend can distinguish from 0
    }

    updateDashboardButton.addEventListener("click", async () => {
        const inputData = {
            // Goal Metrics
            goalMonthlyRevenue: getNumericValue("goal-monthly-revenue"),
            goalProfitMargin: getNumericValue("goal-profit-margin"),
            goalNewClients: getNumericValue("goal-new-clients"),

            // Revenue
            monthlyRevenue: getNumericValue("monthly-revenue"),
            mrr: getNumericValue("mrr"),
            lastMonthRevenue: getNumericValue("last-month-revenue"),
            
            // Profitability
            cogs: getNumericValue("cogs"),
            totalExpenses: getNumericValue("total-expenses"),

            // Clients
            totalClients: getNumericValue("total-clients"),
            newClients: getNumericValue("new-clients"),
            repeatClients: getNumericValue("repeat-clients"),

            // Offer
            numberOfTransactions: getNumericValue("number-of-transactions"),
            // 'conversion-rate' is calculated, 'salesFromLeads' is the input for it
            salesFromLeads: getNumericValue("sales-from-leads"), 

            // Marketing
            totalLeads: getNumericValue("total-leads"),
            emailListSize: getNumericValue("email-list-size"),
            adSpend: getNumericValue("ad-spend"),
            revenueFromAds: getNumericValue("revenue-from-ads"),

            // Systems
            coreSystemsDocumented: getNumericValue("core-systems-documented"),
            tasksAutomated: getNumericValue("tasks-automated"),

            // Time & Leverage
            hoursWorked: getNumericValue("hours-worked"),
            timeInCEOOZone: getNumericValue("time-in-ceo-zone"), // Matched original script.js key

            // Financial Safety
            cashReserve: getNumericValue("cash-reserve"),
            avgMonthlyExpenses: getNumericValue("avg-monthly-expenses"),
            revenueConcentration: getNumericValue("revenue-concentration"),

            // Sales Outreach
            coldDMsSent: getNumericValue("cold-dms"),
            conversationsStarted: getNumericValue("conversations-started"),
            salesCallsFromOutreach: getNumericValue("sales-calls-outreach"),

            // Team & Ops
            teamMembers: getNumericValue("team-members"),
            teamKPIsMet: getNumericValue("team-kpis-met"), // Matched original script.js key
            tasksDelegated: getNumericValue("tasks-delegated"),
            ceoConfidence: getNumericValue("ceo-confidence"),
        };

        // Clear previous results and show processing message
        suggestionsDisplayEl.innerHTML = "<p>Processing your data...</p>";
        goalSuggestionsDisplayEl.innerHTML = "<p>Analyzing progress towards goals...</p>";
        const metricElements = [metricDisplayProfitEl, metricDisplayProfitMarginEl, metricDisplayRevenueGrowthEl, 
                                metricDisplayGrossProfitEl, metricDisplayGrossMarginEl, metricDisplayClientRetentionEl, 
                                metricDisplayAOVEl, metricDisplayLeadToClientEl, metricDisplayCPLEl, 
                                metricDisplayMarketingROIEl, metricDisplayMonthsRunwayEl, metricDisplayColdOutreachConversionEl];
        metricElements.forEach(el => { if(el) el.textContent = "-"; });

        // Clear readonly calculated fields in the form
        const calculatedFieldsIds = [
            "revenue-growth", "monthly-profit", "profit-margin", "gross-profit", "gross-margin",
            "client-retention", "aov", "conversion-rate", "lead-to-client-conversion", "cpl",
            "marketing-roi", "months-runway", "cold-outreach-conversion"
        ];
        calculatedFieldsIds.forEach(id => {
            const field = document.getElementById(id);
            if (field) field.value = "";
        });

        try {
            const response = await fetch(`${apiBaseUrl}/api/process_dashboard_data`, { // Ensure this matches your PythonAnywhere endpoint
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(inputData), // Send all data, backend will handle nulls/NaNs if any
            });

            if (!response.ok) {
                const errorResult = await response.json().catch(() => ({ error: "Failed to process request. Status: " + response.status }));
                throw new Error(errorResult.error || `HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            console.log("Data from backend:", result);
            updateFrontendWithBackendData(result);

        } catch (error) {
            console.error("Error updating dashboard:", error);
            suggestionsDisplayEl.innerHTML = `<p style="color: red;">Error: ${error.message}. Please check your inputs or try again later.</p>`;
            goalSuggestionsDisplayEl.innerHTML = ""; // Clear goal suggestions on error
        }
    });

    function updateFrontendWithBackendData(data) {
        // Update readonly input fields for calculated values
        const calculatedFieldsMapping = {
            "revenue-growth": data.revenueGrowth,
            "monthly-profit": data.monthlyProfit,
            "profit-margin": data.profitMargin,
            "gross-profit": data.grossProfit,
            "gross-margin": data.grossMargin,
            "client-retention": data.clientRetentionRate,
            "aov": data.aov,
            "conversion-rate": data.conversionRate, // This is lead to sales conversion
            "lead-to-client-conversion": data.leadToClientConversionRate, // This is new clients / leads
            "cpl": data.cpl,
            "marketing-roi": data.marketingROI,
            "months-runway": data.monthsRunway,
            "cold-outreach-conversion": data.coldOutreachConversionRate
        };

        for (const id in calculatedFieldsMapping) {
            const field = document.getElementById(id);
            if (field) {
                const value = calculatedFieldsMapping[id];
                if (typeof value === 'number') {
                    // For percentages, backend should send them as X for X%
                    if (id.includes("-margin") || id.includes("-rate") || id.includes("-growth") || id.includes("-roi") || id.includes("-concentration")) {
                        field.value = value.toFixed(2); 
                    } else if (id === "months-runway") {
                        field.value = value.toFixed(1);
                    } else {
                        field.value = value.toFixed(2); // Default to 2 decimal places for currency/other numbers
                    }
                } else {
                    field.value = "N/A";
                }
            }
        }

        // Update metric display cards
        if(metricDisplayProfitEl) metricDisplayProfitEl.textContent = data.monthlyProfit !== null ? `$${data.monthlyProfit.toFixed(2)}` : "-";
        if(metricDisplayProfitMarginEl) metricDisplayProfitMarginEl.textContent = data.profitMargin !== null ? `${data.profitMargin.toFixed(2)}%` : "-";
        if(metricDisplayRevenueGrowthEl) metricDisplayRevenueGrowthEl.textContent = data.revenueGrowth !== null ? `${data.revenueGrowth.toFixed(2)}%` : "-";
        if(metricDisplayGrossProfitEl) metricDisplayGrossProfitEl.textContent = data.grossProfit !== null ? `$${data.grossProfit.toFixed(2)}` : "-";
        if(metricDisplayGrossMarginEl) metricDisplayGrossMarginEl.textContent = data.grossMargin !== null ? `${data.grossMargin.toFixed(2)}%` : "-";
        if(metricDisplayClientRetentionEl) metricDisplayClientRetentionEl.textContent = data.clientRetentionRate !== null ? `${data.clientRetentionRate.toFixed(2)}%` : "-";
        if(metricDisplayAOVEl) metricDisplayAOVEl.textContent = data.aov !== null ? `$${data.aov.toFixed(2)}` : "-";
        if(metricDisplayLeadToClientEl) metricDisplayLeadToClientEl.textContent = data.leadToClientConversionRate !== null ? `${data.leadToClientConversionRate.toFixed(2)}%` : "-";
        if(metricDisplayCPLEl) metricDisplayCPLEl.textContent = data.cpl !== null ? `$${data.cpl.toFixed(2)}` : "-";
        if(metricDisplayMarketingROIEl) metricDisplayMarketingROIEl.textContent = data.marketingROI !== null ? `${data.marketingROI.toFixed(2)}%` : "-";
        if(metricDisplayMonthsRunwayEl) metricDisplayMonthsRunwayEl.textContent = data.monthsRunway !== null ? `${data.monthsRunway.toFixed(1)} months` : "-";
        if(metricDisplayColdOutreachConversionEl) metricDisplayColdOutreachConversionEl.textContent = data.coldOutreachConversionRate !== null ? `${data.coldOutreachConversionRate.toFixed(2)}%` : "-";

        // Display General Suggestions
        if (suggestionsDisplayEl) {
            suggestionsDisplayEl.innerHTML = ""; // Clear previous
            if (data.suggestions && data.suggestions.length > 0) {
                const ul = document.createElement("ul");
                data.suggestions.forEach(suggestion => {
                    const li = document.createElement("li");
                    // Assuming suggestion format from original: {area, metric, value, suggestion, severity}
                    li.innerHTML = `<strong>${suggestion.area} - ${suggestion.metric} (${suggestion.value}):</strong> ${suggestion.suggestion}`;
                    if(suggestion.severity) li.classList.add(`severity-${suggestion.severity}`);
                    ul.appendChild(li);
                });
                suggestionsDisplayEl.appendChild(ul);
            } else {
                suggestionsDisplayEl.innerHTML = "<p>No specific general suggestions at this time.</p>";
            }
        }

        // Display Goal-Oriented Suggestions
        if (goalSuggestionsDisplayEl) {
            goalSuggestionsDisplayEl.innerHTML = ""; // Clear previous
            if (data.goalSuggestions && data.goalSuggestions.length > 0) {
                const ul = document.createElement("ul");
                data.goalSuggestions.forEach(suggestion => {
                    const li = document.createElement("li");
                    // Define a format for goal suggestions, e.g., {goal, current, gap, action}
                    li.innerHTML = `<strong>${suggestion.title}:</strong> ${suggestion.action}`;
                    ul.appendChild(li);
                });
                goalSuggestionsDisplayEl.appendChild(ul);
            } else {
                goalSuggestionsDisplayEl.innerHTML = "<p>No specific goal-oriented suggestions at this time. Ensure goals are set.</p>";
            }
        }

        // --- Update Charts (Uncomment and adapt when ready) ---
        // Ensure chart data structure from backend matches what these functions expect
        /*
        if (charts.revenueChart && data.chartData && data.chartData.revenue) {
            updateRevenueChart(data.chartData.revenue.current, data.chartData.revenue.previous);
        }
        if (charts.profitChart && data.chartData && data.chartData.profit) {
            updateProfitChart(data.chartData.profit.profit, data.chartData.profit.cogs, data.chartData.profit.otherExpenses);
        }
        */
        // For now, let's try to initialize with placeholder data if charts are to be shown
        initializeOrUpdateCharts(data); // Call this to handle chart updates
    }

    function initializeOrUpdateCharts(backendData = {}) {
        const revenueCtx = document.getElementById("revenueChart").getContext("2d");
        if (charts.revenueChart) charts.revenueChart.destroy();
        charts.revenueChart = new Chart(revenueCtx, {
            type: "bar",
            data: {
                labels: ["Last Month Revenue", "Current Month Revenue"],
                datasets: [{
                    label: "Revenue",
                    data: [
                        (backendData.lastMonthRevenue || 0),
                        (backendData.monthlyRevenue || 0)
                    ],
                    backgroundColor: ["rgba(255, 99, 132, 0.5)", "rgba(54, 162, 235, 0.5)"],
                    borderColor: ["rgba(255, 99, 132, 1)", "rgba(54, 162, 235, 1)"],
                    borderWidth: 1
                }]
            },
            options: {
                scales: { y: { beginAtZero: true } },
                responsive: true,
                maintainAspectRatio: false,
                layout: { // <<< ADD THIS BLOCK
                    padding: {
                        left: 10,
                        right: 10,
                        top: 30,
                        bottom: 50
                    }
                }
            }

        });

        const profitCtx = document.getElementById("profitChart").getContext("2d");
        if (charts.profitChart) charts.profitChart.destroy();
        let profit = backendData.monthlyProfit || 0;
        let cogs = backendData.cogs || 0;
        let totalExpenses = backendData.totalExpenses || 0;
        let otherOperatingExpenses = Math.max(0, totalExpenses - cogs); // Ensure non-negative
        
        let profitLabels = ["Monthly Profit", "COGS", "Other Operating Expenses"];
        let profitDataPoints = [profit, cogs, otherOperatingExpenses];
        let profitBackgroundColors = ["rgba(75, 192, 192, 0.5)", "rgba(255, 159, 64, 0.5)", "rgba(255, 99, 132, 0.5)"];
        let profitBorderColors = ["rgba(75, 192, 192, 1)", "rgba(255, 159, 64, 1)", "rgba(255, 99, 132, 1)"];

        if (profit < 0) {
            profitLabels = ["Net Loss", "COGS", "Other Operating Expenses"];
            profitDataPoints = [Math.abs(profit), cogs, otherOperatingExpenses];
            profitBackgroundColors = ["rgba(200, 0, 0, 0.5)", "rgba(255, 159, 64, 0.5)", "rgba(255, 99, 132, 0.5)"];
            profitBorderColors = ["rgba(200, 0, 0, 1)", "rgba(255, 159, 64, 1)", "rgba(255, 99, 132, 1)"];
        }

        charts.profitChart = new Chart(profitCtx, {
            type: "pie",
            data: {
                labels: profitLabels,
                datasets: [{
                    label: "Profit Composition",
                    data: profitDataPoints,
                    backgroundColor: profitBackgroundColors,
                    borderColor: profitBorderColors,
                    borderWidth: 1
                }]
            },
            options: {
                /* ... other options ... */
                responsive: true,
                maintainAspectRatio: false,
                layout: { // <<< ADD THIS BLOCK
                    padding: {
                        left: 10,
                        right: 10,
                        top: 30,
                        bottom: 50
                    }
                }
            }

        });
    }

    if (printReportButton) {
        printReportButton.addEventListener("click", () => {
            window.print();
        });
    }

    // Initialize charts with empty/placeholder data on page load
    initializeOrUpdateCharts(); 
});

