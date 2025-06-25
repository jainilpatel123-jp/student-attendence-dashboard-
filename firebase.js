// Firebase configuration
const firebaseConfig = {
    // Replace with your Firebase config
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_AUTH_DOMAIN",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_STORAGE_BUCKET",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// References to HTML elements
const loginForm = document.getElementById('loginForm');
const loginSection = document.getElementById('loginSection');
const dashboardSection = document.getElementById('dashboardSection');
const logoutBtn = document.getElementById('logoutBtn');
const attendanceForm = document.getElementById('attendanceForm');
const attendanceList = document.getElementById('attendanceList');

// Authentication state observer
firebase.auth().onAuthStateChanged((user) => {
    if (user) {
        // User is signed in
        loginSection.style.display = 'none';
        dashboardSection.style.display = 'block';
        loadAttendanceRecords();
    } else {
        // User is signed out
        loginSection.style.display = 'block';
        dashboardSection.style.display = 'none';
    }
});

// Login form submission
loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    firebase.auth().signInWithEmailAndPassword(email, password)
        .catch((error) => {
            alert('Error: ' + error.message);
        });
});

// Logout functionality
logoutBtn.addEventListener('click', () => {
    firebase.auth().signOut();
});

// Submit attendance
attendanceForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const studentName = document.getElementById('studentName').value;
    const status = document.getElementById('status').value;

    firebase.firestore().collection('attendance').add({
        studentName: studentName,
        status: status,
        timestamp: firebase.firestore.FieldValue.serverTimestamp(),
        userId: firebase.auth().currentUser.uid
    })
    .then(() => {
        attendanceForm.reset();
        loadAttendanceRecords();
    })
    .catch((error) => {
        alert('Error: ' + error.message);
    });
});

// Load attendance records
function loadAttendanceRecords() {
    const userId = firebase.auth().currentUser.uid;
    
    firebase.firestore().collection('attendance')
        .where('userId', '==', userId)
        .orderBy('timestamp', 'desc')
        .onSnapshot((snapshot) => {
            attendanceList.innerHTML = '';
            
            snapshot.forEach((doc) => {
                const data = doc.data();
                const record = document.createElement('div');
                record.className = `attendance-record ${data.status}`;
                record.innerHTML = `
                    <strong>${data.studentName}</strong>
                    <span class="float-end">${data.status.toUpperCase()}</span>
                    <br>
                    <small>${data.timestamp ? new Date(data.timestamp.toDate()).toLocaleString() : 'Just now'}</small>
                `;
                attendanceList.appendChild(record);
            });
        });
}