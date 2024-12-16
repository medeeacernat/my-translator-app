// Încarcă lista de limbi la încărcarea paginii
document.addEventListener("DOMContentLoaded", async () => {
  const languageSelect = document.getElementById("language");

  try {
    const response = await fetch("/languages"); // Cere lista de limbi de la backend
    const languages = await response.json();

    // Verificăm dacă am primit limbile
    if (languages && Array.isArray(languages)) {
      languages.forEach((lang) => {
        const option = document.createElement("option");
        option.value = lang.code; // Codul limbii (ex. "ro", "en")
        option.textContent = `${lang.name} (${lang.code})`; // Numele limbii + codul
        languageSelect.appendChild(option);
      });
    } else {
      console.error("Nu am primit o listă validă de limbi!");
    }
  } catch (error) {
    console.error("Eroare la obținerea limbilor suportate:", error);
  }
});

// Trimitere fișier și parametri către backend pentru traducere
document.getElementById("upload-form").addEventListener("submit", async (e) => {
  e.preventDefault();

  const fileInput = document.getElementById("file");
  const languageInput = document.getElementById("language");
  const formData = new FormData();

  const file = fileInput.files[0];

  if (file && languageInput.value) {
    formData.append("file", file);
    formData.append("targetLanguage", languageInput.value);
  } else {
    alert("Selectați un fișier și o limbă pentru traducere!");
    return;
  }

  try {
    const response = await fetch("/translate", {
      method: "POST",
      body: formData,
    });

    const data = await response.json();
    if (response.ok) {
      document.getElementById("result").textContent = data.translation;
    } else {
      document.getElementById("result").textContent = "Eroare la traducere!";
    }
  } catch (error) {
    console.error("Eroare de rețea:", error);
    document.getElementById("result").textContent = "Eroare la traducere!";
  }
});
