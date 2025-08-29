document.addEventListener("DOMContentLoaded", function () {
  let allVisitors = [];
  let filteredVisitors = [];
  let currentPage = 1;
  let entriesPerPage = 5;
  let searchValue = "";

  const tbody = document.querySelector(".visitor-table tbody");
  const searchInput = document.getElementById("search");
  const entriesSelect = document.getElementById("entries");
  const paginationFooter = document.querySelector(".pagination-footer");
  const paginationDiv = paginationFooter.querySelector(".pagination");
  const showingText = paginationFooter.firstChild; // "Showing ... entries"

  // ---- FETCH DATA ----
  fetch("/api/today-visitors")
    .then(res => res.json())
    .then(data => {
  console.log('Fetched data:', data); // Add this!
  allVisitors = data || [];
  filteredVisitors = [...allVisitors];
  renderTable();
  renderPagination();
  updateShowingText();
})

    .catch(err => {
      tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;">Failed to load</td></tr>`;
    });

  // ---- SEARCH HANDLER ----
  searchInput.addEventListener("input", function () {
    searchValue = this.value.trim().toLowerCase();
    currentPage = 1;
    filterData();
    renderTable();
    renderPagination();
    updateShowingText();
  });

  // ---- ENTRIES PER PAGE ----
  entriesSelect.addEventListener("change", function () {
    entriesPerPage = +this.value;
    currentPage = 1;
    renderTable();
    renderPagination();
    updateShowingText();
  });

  // ---- PAGINATION BUTTONS ----
  paginationDiv.addEventListener("click", function (e) {
    if (!e.target.matches("button")) return;
    const btn = e.target;
    const pageNum = btn.dataset.page ? +btn.dataset.page : null;
    if (btn.textContent === "First") currentPage = 1;
    else if (btn.textContent === "Previous" && currentPage > 1) currentPage--;
    else if (btn.textContent === "Next" && currentPage < getPageCount()) currentPage++;
    else if (btn.textContent === "Last") currentPage = getPageCount();
    else if (pageNum) currentPage = pageNum;
    renderTable();
    renderPagination();
    updateShowingText();
  });

  // ---- TABLE CLICK: GENERATE PASS (eye icon) or PUNCH OUT ----
  tbody.addEventListener("click", function (e) {
    if (e.target.classList.contains("icon-eye")) {
      const id = e.target.dataset.id;
      window.location.href = `/visitor-pass.html?id=${id}`;
    } else if (e.target.classList.contains("icon-punchout")) {
      const id = +e.target.dataset.id;
      punchOutVisitor(id);
    }
  });

  // ------ MAIN RENDERING & FILTERING LOGIC ------

  function filterData() {
    if (!searchValue) {
      filteredVisitors = [...allVisitors];
    } else {
      filteredVisitors = allVisitors.filter(
        v => (v.name || "").toLowerCase().includes(searchValue)
      );
    }
  }

  function getPageCount() {
    return Math.max(1, Math.ceil(filteredVisitors.length / entriesPerPage));
  }

  function getPageData() {
    const startIdx = (currentPage - 1) * entriesPerPage;
    const endIdx = startIdx + entriesPerPage;
    return filteredVisitors.slice(startIdx, endIdx);
  }

  function renderTable() {
    const dataToShow = getPageData();
    tbody.innerHTML = "";
    if (dataToShow.length === 0) {
      tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;">No Data Found</td></tr>`;
      return;
    }
    dataToShow.forEach((visitor, i) => {
      // Punch out logic
      let punchOutCell;
      if (!visitor.out_time) {
        punchOutCell = `<i class="fas fa-sign-out-alt icon-green icon-punchout" title="Punch Out" data-id="${visitor.id}" style="cursor:pointer"></i>`;
      } else {
  // nicely format out_time to local time (hh:mm)
  const dt = new Date(visitor.out_time);
  punchOutCell = isNaN(dt) ? visitor.out_time : dt.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
}

      tbody.innerHTML += `
        <tr>
          <td>${(currentPage - 1) * entriesPerPage + i + 1}</td>
          <td>${visitor.mobile}</td>
          <td>${visitor.name}</td>
          <td>${visitor.officer_name || ""}</td>
          <td><i class="fas fa-eye icon-red icon-eye" title="View Pass" data-id="${visitor.id}" style="cursor:pointer"></i></td>
          <td>${punchOutCell}</td>
        </tr>
      `;
    });
  }

  function renderPagination() {
    const totalPages = getPageCount();
    let html = '';
    html += `<button ${currentPage === 1 ? 'disabled' : ''}>First</button>`;
    html += `<button ${currentPage === 1 ? 'disabled' : ''}>Previous</button>`;

    // Only one page, only show [1]
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) {
        html += `<button class="${i === currentPage ? 'active' : ''}" data-page="${i}">${i}</button>`;
      }
    } else {
      // Show first, ..., current-1, current, current+1, ..., last
      let min = Math.max(1, currentPage - 2);
      let max = Math.min(totalPages, currentPage + 2);
      if (min > 1) html += `<span style="padding:0 2px;">...</span>`;
      for (let i = min; i <= max; i++) {
        html += `<button class="${i === currentPage ? 'active' : ''}" data-page="${i}">${i}</button>`;
      }
      if (max < totalPages) html += `<span style="padding:0 2px;">...</span>`;
    }
    html += `<button ${currentPage === totalPages ? 'disabled' : ''}>Next</button>`;
    html += `<button ${currentPage === totalPages ? 'disabled' : ''}>Last</button>`;
    paginationDiv.innerHTML = html;
  }

  function updateShowingText() {
    const total = filteredVisitors.length;
    let start = total === 0 ? 0 : (currentPage - 1) * entriesPerPage + 1;
    let end = Math.min(currentPage * entriesPerPage, total);

    paginationFooter.childNodes[0].nodeValue = `Showing ${start} to ${end} of ${total} entries `;
  }

function punchOutVisitor(id) {
 fetch(`/api/visitor-punchout/${id}`, {
 method: "PATCH"
 })
.then(res => {
if (!res.ok) throw new Error("Failed to punch out");
return fetch("/api/today-visitors").then(r => r.json());
 })
 .then(data => {
allVisitors = data || [];
filterData();
 renderTable();
renderPagination();
 updateShowingText();
 })
 .catch(err => {
 alert("Punch out failed. Please try again.");
 console.error(err);
});
}
  }
);