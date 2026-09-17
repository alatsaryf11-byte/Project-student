console.log('==========================');
console.log('HSI STUDENT MANAGEMENT');
console.log('==========================');
const STORAGE_KEY = "students";

// Ambil data dari LocalStorage.
// Jika belum ada data, gunakan array kosong.
let students = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
let editingStudentId = null;
let alertTimer;

// Elemen DOM
const studentForm = document.getElementById("studentForm");
const studentName = document.getElementById("studentName");
const studentScore = document.getElementById("studentScore");
const studentList = document.getElementById("studentList");
const totalStudents = document.getElementById("totalStudents");
const averageScore = document.getElementById("averageScore");
const alertMessage = document.getElementById("alertMessage");
const submitButton = document.getElementById("submitButton");
const cancelEditButton = document.getElementById("cancelEditButton");
const formTitle = document.getElementById("formTitle");
const searchStudent = document.getElementById("searchStudent");

// Simpan array students ke LocalStorage.
function saveStudents() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(students));
}

// Tampilkan daftar siswa ke halaman.
function renderStudents() {
    const keyword = searchStudent.value.trim().toLowerCase();

    const filteredStudents = students.filter((student) =>
        student.name.toLowerCase().includes(keyword)
    );

    if (filteredStudents.length === 0) {
        studentList.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">📭</div>
                <h3>${students.length === 0 ? "Belum ada siswa" : "Siswa tidak ditemukan"}</h3>
                <p>${students.length === 0
                    ? "Tambahkan siswa melalui form di sebelah kiri."
                    : "Coba gunakan kata kunci nama yang lain."
                }</p>
            </div>
        `;
        updateStatistics();
        return;
    }

    studentList.innerHTML = filteredStudents.map((student, index) => `
        <article class="student-item">
            <div class="student-number">${index + 1}</div>

            <div class="student-info">
                <h3>${escapeHTML(student.name)}</h3>
                <p>Data student ID: ${student.id}</p>
                <span class="score">Nilai: ${student.score}</span>
            </div>

            <div class="student-actions">
                <button
                    type="button"
                    class="action-btn edit-btn"
                    onclick="editStudent(${student.id})"
                >
                    ✏️ Ubah
                </button>
                <button
                    type="button"
                    class="action-btn delete-btn"
                    onclick="deleteStudent(${student.id})"
                >
                    🗑️ Hapus
                </button>
            </div>
        </article>
    `).join("");

    updateStatistics();
}

// Update total siswa dan rata-rata nilai.
function updateStatistics() {
    totalStudents.textContent = students.length;

    if (students.length === 0) {
        averageScore.textContent = "0";
        return;
    }

    const totalScore = students.reduce(
        (total, student) => total + Number(student.score),
        0
    );

    const average = totalScore / students.length;
    averageScore.textContent = Number.isInteger(average)
        ? average
        : average.toFixed(1);
}

// Tambah siswa baru.
function addStudent() {
    const name = studentName.value.trim();
    const score = Number(studentScore.value);

    if (!name) {
        showAlert("⚠️ Nama siswa wajib diisi.", "update");
        studentName.focus();
        return;
    }

    if (studentScore.value === "" || score < 0 || score > 100) {
        showAlert("⚠️ Nilai harus berada di antara 0 sampai 100.", "update");
        studentScore.focus();
        return;
    }

    const newStudent = {
        id: Date.now(),
        name: name,
        score: score
    };

    students.push(newStudent);
    saveStudents();
    renderStudents();
    resetForm();

    showAlert(`✅ Data siswa ${name} berhasil ditambahkan.`, "success");
}

// Masuk ke mode edit.
function editStudent(id) {
    const student = students.find((item) => item.id === id);

    if (!student) {
        return;
    }

    editingStudentId = id;
    studentName.value = student.name;
    studentScore.value = student.score;

    formTitle.textContent = "Edit Siswa";
    submitButton.innerHTML = "💾 Update Siswa";
    cancelEditButton.classList.remove("hidden");

    studentName.focus();
    window.scrollTo({ top: 0, behavior: "smooth" });
}

// Update siswa yang sedang diedit.
function updateStudent() {
    const name = studentName.value.trim();
    const score = Number(studentScore.value);

    if (!name) {
        showAlert("⚠️ Nama siswa wajib diisi.", "update");
        studentName.focus();
        return;
    }

    if (studentScore.value === "" || score < 0 || score > 100) {
        showAlert("⚠️ Nilai harus berada di antara 0 sampai 100.", "update");
        studentScore.focus();
        return;
    }

    const student = students.find((item) => item.id === editingStudentId);

    if (!student) {
        resetForm();
        return;
    }

    student.name = name;
    student.score = score;

    saveStudents();
    renderStudents();
    resetForm();

    showAlert(`🔄 Data siswa ${name} berhasil diperbarui.`, "update");
}

// Hapus siswa dengan confirm dialog.
function deleteStudent(id) {
    const student = students.find((item) => item.id === id);

    if (!student) {
        return;
    }

    const confirmed = confirm(
        `Apakah kamu yakin ingin menghapus siswa ${student.name}?`
    );

    if (!confirmed) {
        return;
    }

    students = students.filter((item) => item.id !== id);

    // Jika siswa yang dihapus sedang diedit, batalkan mode edit.
    if (editingStudentId === id) {
        resetForm();
    }

    saveStudents();
    renderStudents();

    showAlert(`🗑️ Data siswa ${student.name} berhasil dihapus.`, "delete");
}

// Reset form dan kembali ke mode tambah.
function resetForm() {
    studentForm.reset();
    editingStudentId = null;
    formTitle.textContent = "Tambah Siswa";
    submitButton.innerHTML = "➕ Tambah Siswa";
    cancelEditButton.classList.add("hidden");
}

// Tampilkan notifikasi.
function showAlert(message, type = "success") {
    clearTimeout(alertTimer);

    alertMessage.textContent = message;
    alertMessage.className = `alert show ${type}`;

    alertTimer = setTimeout(() => {
        alertMessage.className = "alert";
    }, 3000);
}

// Mencegah input nama menyisipkan HTML ke dalam daftar.
function escapeHTML(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
}

// Submit form tanpa refresh halaman.
studentForm.addEventListener("submit", (event) => {
    event.preventDefault();

    if (editingStudentId === null) {
        addStudent();
    } else {
        updateStudent();
    }
});

// Tombol batal edit.
cancelEditButton.addEventListener("click", () => {
    resetForm();
});

// Search student secara langsung.
searchStudent.addEventListener("input", renderStudents);

// Render pertama kali ketika halaman dibuka.
renderStudents();
