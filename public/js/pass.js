// document.addEventListener("DOMContentLoaded", () => {
//   const params = new URLSearchParams(window.location.search);
//   const visitorId = params.get("id");

//   if (!visitorId) {
//     alert("No visitor ID provided.");
//     return;
//   }

//   fetch(`/api/visitor/${visitorId}`)
//     .then(res => res.json())
//     .then(visitor => {
//       document.getElementById("visitor-name").textContent = visitor.name;
//       document.getElementById("visitor-mobile").textContent = visitor.mobile;
//       document.getElementById("organisation-name").textContent = visitor.organization;
//       document.getElementById("designation").textContent = visitor.designation;
//       document.getElementById("country").textContent = visitor.country;
//       document.getElementById("address").textContent = visitor.address;
//       document.getElementById("visiting-purpose").textContent = visitor.purpose;
//       document.getElementById("visiting-date").textContent = new Date(visitor.in_time).toLocaleDateString();

//       document.getElementById("employee-name").textContent = visitor.officer_name;
//       document.getElementById("desg").textContent = visitor.officer_designation;

//       // Show photo if exists
//       if (visitor.photo_path) {
//         document.getElementById("visitor-photo").src = visitor.photo_path;
//       } else {
//         document.getElementById("visitor-photo").src = "img/placeholder.png";
//       }
//     })
//     .catch(err => console.error("Error fetching visitor details:", err));
// });

document.addEventListener("DOMContentLoaded", () => {
 const params = new URLSearchParams(window.location.search);
  const visitorId = params.get("id");

  if (!visitorId) {
    alert("No visitor ID provided.");
    return;
  }

  fetch(`/api/visitor/${visitorId}`)
    .then(res => res.json())
    .then(visitor => {
      document.getElementById("visitor-name").textContent = visitor.name;
      document.getElementById("visitor-mobile").textContent = visitor.mobile;
      document.getElementById("organisation-name").textContent = visitor.organization;
      document.getElementById("designation").textContent = visitor.designation;
      document.getElementById("country").textContent = visitor.country;
      document.getElementById("address").textContent = visitor.address;
      document.getElementById("visiting-purpose").textContent = visitor.purpose;
      document.getElementById("visiting-date").textContent = new Date(visitor.in_time).toLocaleDateString();

      document.getElementById("employee-name").textContent = visitor.officer_name;
      document.getElementById("desg").textContent = visitor.officer_designation;

      // Show photo if exists
      if (visitor.photo_path) {
        document.getElementById("visitor-photo").src = visitor.photo_path;
      } else {
        document.getElementById("visitor-photo").src = "img/placeholder.png";
      }
    })
    .catch(err => console.error("Error fetching visitor details:", err));
});

  // --- PDF Download Functionality ---
  document.getElementById("download-pdf-btn").addEventListener("click", function () {
    // Grab only the main pass content (excluding navigation/buttons)
    const target = document.querySelector(".main-content");

    // Hide download & back buttons in the PDF
    this.style.visibility = "hidden";
    let backBtn = document.querySelector('button[onclick]');
    if (backBtn) backBtn.style.visibility = "hidden";

    html2canvas(target, {scale: 2}).then(canvas => {
      const imgData = canvas.toDataURL("image/png");
      const pdf = new window.jspdf.jsPDF({
        orientation: "portrait",
        unit: "px",
        format: [canvas.width, canvas.height]
      });

      pdf.addImage(imgData, "PNG", 0, 0, canvas.width, canvas.height);
      pdf.save("visitor-pass.pdf");

      // Restore buttons visibility
      this.style.visibility = "visible";
      if (backBtn) backBtn.style.visibility = "visible";
    });
  });


