document.addEventListener("DOMContentLoaded", () => {
  const activitiesList = document.getElementById("activities-list");
  const activitySelect = document.getElementById("activity");
  const signupForm = document.getElementById("signup-form");
  const messageDiv = document.getElementById("message");

  // Function to fetch activities from API
  async function fetchActivities() {
    try {
      const response = await fetch("/activities");
      const activities = await response.json();

      // Clear loading message
      activitiesList.innerHTML = "";

      // Populate activities list
      Object.entries(activities).forEach(([name, details]) => {
        const activityCard = document.createElement("div");
        activityCard.className = "activity-card";

        const spotsLeft = details.max_participants - details.participants.length;
        let availabilityClass = "availability";
        
        if (spotsLeft === 0) {
          availabilityClass += " full";
        } else if (spotsLeft <= 3) {
          availabilityClass += " limited";
        }

        // Create participant list HTML
        const participantsList = document.createElement("div");
        participantsList.className = "participant-list";
        
        const participantHeader = document.createElement("h5");
        participantHeader.innerHTML = `参加者リスト <span class="count">${details.participants.length}</span>`;
        participantsList.appendChild(participantHeader);
        
        const participantUl = document.createElement("ul");
        if (details.participants.length > 0) {
          details.participants.forEach(participant => {
            const li = document.createElement("li");
            li.textContent = participant;
            participantUl.appendChild(li);
          });
        } else {
          const li = document.createElement("li");
          li.textContent = "まだ参加者はいません";
          li.style.fontStyle = "italic";
          li.style.color = "#999";
          participantUl.appendChild(li);
        }
        participantsList.appendChild(participantUl);

        activityCard.innerHTML = `
          <h4>${name}</h4>
          <p>${details.description}</p>
          <p><strong>スケジュール:</strong> ${details.schedule}</p>
          <p class="${availabilityClass}">残り ${spotsLeft} 席</p>
        `;
        
        activityCard.appendChild(participantsList);
        activitiesList.appendChild(activityCard);

        // アニメーション効果を追加
        setTimeout(() => {
          activityCard.style.opacity = "1";
        }, 100);

        // Add option to select dropdown
        const option = document.createElement("option");
        option.value = name;
        option.textContent = name;
        activitySelect.appendChild(option);
      });
    } catch (error) {
      activitiesList.innerHTML = "<p>アクティビティの読み込みに失敗しました。後でもう一度お試しください。</p>";
      console.error("Error fetching activities:", error);
    }
  }

  // Handle form submission
  signupForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const activity = document.getElementById("activity").value;

    try {
      const response = await fetch(
        `/activities/${encodeURIComponent(activity)}/signup?email=${encodeURIComponent(email)}`,
        {
          method: "POST",
        }
      );

      const result = await response.json();

      if (response.ok) {
        messageDiv.textContent = result.message;
        messageDiv.className = "success";
        signupForm.reset();
      } else {
        messageDiv.textContent = result.detail || "An error occurred";
        messageDiv.className = "error";
      }

      messageDiv.classList.remove("hidden");

      // Hide message after 5 seconds
      setTimeout(() => {
        messageDiv.classList.add("hidden");
      }, 5000);
    } catch (error) {
      messageDiv.textContent = "Failed to sign up. Please try again.";
      messageDiv.className = "error";
      messageDiv.classList.remove("hidden");
      console.error("Error signing up:", error);
    }
  });

  // Initialize app
  fetchActivities();
});
