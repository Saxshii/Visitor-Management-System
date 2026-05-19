document.addEventListener("DOMContentLoaded", () => {
  let allData = []; // Store all visitors fetched once
  const fromDateEl = document.getElementById("from-date");
  const toDateEl = document.getElementById("to-date");
  const nameSearchEl = document.querySelector(".table-search-input");
  const dateSearchBtn = document.getElementById("search-btn");
  const resetBtn = document.getElementById("reset-btn");
  const downloadBtn = document.querySelector(".download-btn");
  const tbody = document.querySelector(".visitor-table tbody");

  // Fetch all data on load
  fetch("/api/visitor-summary")
    .then((res) => res.json())
    .then((data) => {
      allData = data || [];
      renderTable(allData);
    })
    .catch((err) => {
      console.error("Error fetching summary:", err);
      tbody.innerHTML = `<tr><td colspan="9" style="text-align:center; color:#d9534f;">Failed to load data</td></tr>`;
    });

  // Function to render table rows
  function renderTable(data) {
    tbody.innerHTML = "";
    if (!data.length) {
      tbody.innerHTML = `<tr><td colspan="9" style="text-align:center;">No visitor history found</td></tr>`;
      return;
    }
    data.forEach((visitor, index) => {
      const inTime = new Date(visitor.in_time);
      const visitDate = inTime.toLocaleDateString("en-GB");
      const visitInTime = inTime.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
      let visitOutTime = "-";
      if (visitor.out_time) {
        const outTime = new Date(visitor.out_time);
        visitOutTime = outTime.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
      }
      tbody.innerHTML += `
        <tr>
          <td>${index + 1}</td>
          <td>${visitor.mobile || ""}</td>
          <td>${visitor.name || ""}</td>
          <td>${visitor.purpose || ""}</td>
          <td>${visitor.organization || ""}</td>
          <td>${visitor.officer_name || ""}</td>
          <td>${visitDate}</td>
          <td>${visitInTime}</td>
          <td>${visitOutTime}</td>
        </tr>`;
    });
  }

  // Combined filter function
  function filterData() {
    let filtered = allData;

    // Date filter
    const fromDateVal = fromDateEl.value;
    const toDateVal = toDateEl.value;

    if (fromDateVal) {
      filtered = filtered.filter((visitor) => {
        return new Date(visitor.in_time) >= new Date(fromDateVal);
      });
    }
    if (toDateVal) {
      filtered = filtered.filter((visitor) => {
        return new Date(visitor.in_time) <= new Date(toDateVal);
      });
    }

    // Name search filter (case-insensitive substring match)
    const nameSearchVal = nameSearchEl.value.trim().toLowerCase();
    if (nameSearchVal) {
      filtered = filtered.filter((visitor) => {
        return (visitor.name || "").toLowerCase().includes(nameSearchVal);
      });
    }

    return filtered;
  }

  // Event: Date Search Button clicked - apply date filter only + name filter
  dateSearchBtn.addEventListener("click", () => {
    const filtered = filterData();
    renderTable(filtered);
  });

  // Event: Name search input live filter (optional, can be commented if you want only button search)
  nameSearchEl.addEventListener("input", () => {
    const filtered = filterData();
    renderTable(filtered);
  });

  // Event: Reset button clears filters and reloads full data
  resetBtn.addEventListener("click", () => {
    fromDateEl.value = "";
    toDateEl.value = "";
    nameSearchEl.value = "";
    renderTable(allData);
  });

  // Event: Download button exports current filtered data as CSV
  downloadBtn.addEventListener("click", () => {
    const filtered = filterData();
    if (!filtered.length) {
      alert("No data available to download.");
      return;
    }
    const csvRows = [];

    // Headers
    csvRows.push([
      "S.No.",
      "Mobile Number",
      "Visitor Name",
      "Purpose",
      "Visitor Organization",
      "RITES Officer Name",
      "Visiting Date",
      "Visit In Time",
      "Visit Out Time",
    ].join(","));

    // Data rows
    filtered.forEach((visitor, index) => {
      const inTime = new Date(visitor.in_time);
      const visitDate = inTime.toLocaleDateString("en-GB");
      const visitInTime = inTime.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
      let visitOutTime = "-";
      if (visitor.out_time) {
        const outTime = new Date(visitor.out_time);
        visitOutTime = outTime.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
      }

      // Escape commas in data fields if needed by wrapping in double quotes:
      function escapeCSV(value) {
        if (!value) return "";
        const stringValue = value.toString();
        return stringValue.includes(",") ? `"${stringValue}"` : stringValue;
      }

      csvRows.push(
        [
          index + 1,
          escapeCSV(visitor.mobile),
          escapeCSV(visitor.name),
          escapeCSV(visitor.purpose),
          escapeCSV(visitor.organization),
          escapeCSV(visitor.officer_name),
          visitDate,
          visitInTime,
          visitOutTime,
        ].join(",")
      );
    });

    // Create and download CSV
    const csvString = csvRows.join("\n");
    const blob = new Blob([csvString], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "visitor_summary_report.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  });
});
