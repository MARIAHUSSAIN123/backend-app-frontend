// ==================== Config ====================
const backendURL = "http://localhost:5000/api"; // Make sure backend is running

// ==================== DOM Elements ====================
const formSection = document.getElementById("form-section");
const quizSection = document.getElementById("quiz-section");
const studentForm = document.getElementById("studentForm");
const quizDiv = document.getElementById("quiz");
const submitQuiz = document.getElementById("submitQuiz");

// ==================== Data ====================
let studentData = {};
let questions = [];
let answers = [];

// ==================== Form Submit ====================
studentForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  // Collect student info
  studentData = {
    name: document.getElementById("name").value,
    fatherName: document.getElementById("fatherName").value,
    email: document.getElementById("email").value,
    contactNum: document.getElementById("contactNum").value,
    batchNum: document.getElementById("batchNum").value,
    trainerName: document.getElementById("trainerName").value,
  };

  // Fetch questions from backend
  try {
    const res = await fetch(`${backendURL}/questions`);
    if (!res.ok) throw new Error("Failed to fetch questions");
    questions = await res.json();

    // Show quiz
    showQuiz();
    formSection.style.display = "none";
    quizSection.style.display = "block";
  } catch (err) {
    console.error(err);
    alert(
      "Could not load quiz questions. Make sure the backend is running at http://localhost:5000"
    );
  }
});

// ==================== Show Quiz ====================
function showQuiz() {
  quizDiv.innerHTML = questions
    .map(
      (q, i) => `
    <div class="question">
      <p>${i + 1}. ${q.q}</p>
      ${q.opts
        .map(
          (opt, idx) => `
        <label>
          <input type="radio" name="q${i}" value="${idx}"> ${opt}
        </label>
      `
        )
        .join("")}
    </div>
  `
    )
    .join("");
}

// ==================== Submit Quiz ====================
submitQuiz.addEventListener("click", async () => {
  // Collect answers
  answers = questions.map((q, i) => {
    const selected = document.querySelector(`input[name="q${i}"]:checked`);
    return { questionId: q._id, selected: selected ? parseInt(selected.value) : -1 };
  });

  // Calculate score
  const score = answers.reduce(
    (acc, a, i) => (a.selected === questions[i].ans ? acc + 1 : acc),
    0
  );

  // Submit to backend
  try {
    const res = await fetch(`${backendURL}/students`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...studentData, answers, score }),
    });

    if (!res.ok) throw new Error("Failed to submit quiz");

    alert(`Quiz submitted successfully! Your score: ${score}/${questions.length}`);
    window.location.reload(); // Reload page
  } catch (err) {
    console.error(err);
    alert("Error submitting quiz. Make sure the backend is running.");
  }
});
