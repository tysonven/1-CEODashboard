// script.js - 1% Club Business Health Dashboard (GHL Widget)
document.addEventListener("DOMContentLoaded", () => {
    const apiBaseUrl = "https://tysonven.pythonanywhere.com"; // IMPORTANT: Replace with actual PythonAnywhere URL or custom domain
    const updateDashboardButton = document.getElementById("updateDashboard");
    const businessDataForm = document.getElementById("businessDataForm");

    const metricProfitEl = document.getElementById("metricProfit");
    const metricProfitMarginEl = document.getElementById("metricProfitMargin");
    const metricCACEl = document.getElementById("metricCAC");
    const suggestionsDisplayEl = document.getElementById("suggestionsDisplay");
    const printReportButton = document.getElementById("printReportButton");

  //  let performanceChart = null; // To store the Chart.js instance
/*
    // Function to initialize or update the chart
    function renderChart(chartData) {
        const ctx = document.getElementById("performanceChart").getContext("2d");
        if (performanceChart) {
            performanceChart.destroy(); // Destroy previous chart instance if exists
        }
        performanceChart = new Chart(ctx, {
            type: "bar", // Or pie, line, etc.
            data: chartData,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }
*/
    updateDashboardButton.addEventListener("click", async () => {
        const formData = new FormData(businessDataForm);
        const data = {};
        formData.forEach((value, key) => {
            data[key] = parseFloat(value) || 0; // Ensure numeric, default to 0 if NaN
        });

        // Basic frontend validation (can be more extensive)
        if (isNaN(data.revenue) || isNaN(data.expenses) || isNaN(data.marketing_spend) || isNaN(data.new_customers)) {
            alert("Please ensure all fields are filled with valid numbers.");
            return;
        }
        if (data.new_customers <= 0 && data.marketing_spend > 0) {
             // Avoid division by zero for CAC if marketing spend exists but no new customers
            // The backend handles this, but good to be aware on frontend too
        }

        suggestionsDisplayEl.innerHTML = "<p>Processing your data...</p>";
        metricProfitEl.textContent = "-";
        metricProfitMarginEl.textContent = "-";
        metricCACEl.textContent = "-";

        try {
            // IMPORTANT: Replace with your actual API endpoint. 
            // If you set up dashboard-api.yourdomain.com, use that.
            // Otherwise, use yourusername.pythonanywhere.com/api/process_dashboard_data
            const response = await fetch(`${apiBaseUrl}/api/process_dashboard_data`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                const errorResult = await response.json().catch(() => ({ error: "Failed to process request. Status: " + response.status }));
                throw new Error(errorResult.error || `HTTP error! status: ${response.status}`);
            }

            const result = await response.json();

            // Update metrics
            metricProfitEl.textContent = `$${result.metrics.profit.toFixed(2)}`;
            metricProfitMarginEl.textContent = `${result.metrics.profit_margin.toFixed(2)}%`;
            metricCACEl.textContent = `$${result.metrics.cac.toFixed(2)}`;
            // Update more metrics as needed

            // Update suggestions
            suggestionsDisplayEl.innerHTML = ""; // Clear previous suggestions
            if (result.suggestions && result.suggestions.length > 0) {
                const ul = document.createElement("ul");
                result.suggestions.forEach(suggestionText => {
                    const li = document.createElement("li");
                    li.textContent = suggestionText;
                    ul.appendChild(li);
                });
                suggestionsDisplayEl.appendChild(ul);
            } else {
                suggestionsDisplayEl.innerHTML = "<p>No specific suggestions at this time.</p>";
            }

            // Update chart
          //  if (result.chart_data) {
           //     renderChart(result.chart_data);
           // }

        } catch (error) {
            console.error("Error updating dashboard:", error);
            suggestionsDisplayEl.innerHTML = `<p style="color: red;">Error: ${error.message}. Please check your inputs or try again later.</p>`;
        }
    });

    printReportButton.addEventListener("click", () => {
        window.print();
    });

    // Initial placeholder chart (optional)
   /* renderChart({
        labels: ["Awaiting Data"],
        datasets: [{
            label: "Financial Overview",
            data: [0],
            backgroundColor: ["rgba(200, 200, 200, 0.6)"]
        }]
    });
*/
    // Reminder for the user to update the API URL
    if (apiBaseUrl === "https://yourusername.pythonanywhere.com") {
        const header = document.querySelector("header");
        const reminder = document.createElement("p");
        reminder.innerHTML = "<strong>Important:</strong> The API URL in <code>script.js</code> needs to be updated to your actual PythonAnywhere or custom domain! This is currently a placeholder.";
        reminder.style.backgroundColor = "yellow";
        reminder.style.padding = "10px";
        reminder.style.textAlign = "center";
        header.parentNode.insertBefore(reminder, header.nextSibling);
    }
});

