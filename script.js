const form = document.getElementById('searchForm');
    const usernameInput = document.getElementById('usernameInput');
    const profileContainer = document.getElementById('profileContainer');
    const spinner = document.getElementById('spinner');
    const errorMessage = document.getElementById('errorMessage');
    const toggleMode = document.getElementById('toggleMode');

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const username = usernameInput.value.trim();
      if (username === "") {
        showError("Please enter a GitHub username.");
        return;
      }
      fetchUser(username);
    });

    toggleMode.addEventListener('click', () => {
      document.body.classList.toggle('dark-mode');
      toggleMode.textContent = document.body.classList.contains('dark-mode') ? "☀️" : "🌙";
    });

    function showSpinner() {
      spinner.style.display = 'flex';
    }

    function hideSpinner() {
      spinner.style.display = 'none';
    }

    function showError(message) {
      errorMessage.textContent = message;
      profileContainer.innerHTML = "";
    }

    function clearError() {
      errorMessage.textContent = "";
    }

    async function fetchUser(username) {
      clearError();
      showSpinner();
      try {
        const userResponse = await fetch(`https://api.github.com/users/${username}`);
        if (!userResponse.ok) {
          hideSpinner();
          if (userResponse.status === 404) {
            showError("User not found.");
          } else if (userResponse.status === 403) {
            showError("API rate limit exceeded. Try again later.");
          } else {
            showError("An error occurred. Please try again.");
          }
          return;
        }

        const userData = await userResponse.json();
        const reposResponse = await fetch(userData.repos_url + '?per_page=100');
        const reposData = await reposResponse.json();
        displayUser(userData, reposData);
      } catch (err) {
        console.error(err);
        showError("Network error. Please check your connection.");
      } finally {
        hideSpinner();
      }
    }

    function displayUser(user, repos) {
      profileContainer.innerHTML = `
        <div class="profile">
          <img src="${user.avatar_url}" alt="${user.name || user.login}'s avatar" />
          <div class="profile-info">
            <h2>${user.name || user.login}</h2>
            <p>${user.bio || ""}</p>
            <p>${user.location ? `📍 ${user.location}` : ""}</p>
            <p>${user.company ? `🏢 ${user.company}` : ""}</p>
            <p>${user.blog ? `🔗 <a href="${user.blog}" target="_blank">${user.blog}</a>` : ""}</p>
            <p>${user.twitter_username ? `🐦 <a href="https://twitter.com/${user.twitter_username}" target="_blank">@${user.twitter_username}</a>` : ""}</p>
            <p>Joined: ${new Date(user.created_at).toLocaleDateString()}</p>
            <p>${user.hireable ? "✅ Available for hire" : ""}</p>
          </div>
          <div class="stats">
            <div class="stat"><strong>Repos</strong><br>${user.public_repos}</div>
            <div class="stat"><strong>Followers</strong><br>${user.followers}</div>
            <div class="stat"><strong>Following</strong><br>${user.following}</div>
            <div class="stat"><strong>Gists</strong><br>${user.public_gists}</div>
          </div>
        </div>
        <div class="repos">
          <h3>Public Repositories</h3>
          <div class="repo-list">
            ${repos.map(repo => `
              <div class="repo">
                <h4><a href="${repo.html_url}" target="_blank">${repo.name}</a></h4>
                <p>${repo.description || "No description"}</p>
                <p>⭐ ${repo.stargazers_count} | 🍴 ${repo.forks_count} | ${repo.language || "Unknown"}</p>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    }
