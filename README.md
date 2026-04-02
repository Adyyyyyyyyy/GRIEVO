 GRIEVO — Student Grievance & Feedback Management System

A web-based platform to digitize and streamline the process of submitting, tracking, and resolving student grievances in a college or university.

---

## 🏗️ Tech Stack

### Frontend
- React 18 + TypeScript
- Vite
- Tailwind CSS v4
- shadcn/ui + Radix UI
- Framer Motion
- Recharts
- Lucide React
- Sonner (toast notifications)

### Backend
- Python 3 + Flask
- Flask-CORS
- mysql-connector-python
- python-dotenv
- Werkzeug
- smtplib (email notifications)

### Database
- MySQL

---

## 📁 Repository Structure
```
GRIEVO/
├── backend          → Flask backend (this branch)
├── project-ui       → React frontend
└── main             → Root
```

---

## ⚙️ Backend Setup

### 1. Clone the repository and switch to backend branch
```bash
git clone https://github.com/Adyyyyyyyyy/GRIEVO.git
cd GRIEVO
git checkout backend
```

### 2. Install Python dependencies
```bash
pip install -r requirements.txt
```

### 3. Setup MySQL Database
Make sure MySQL is installed and running on your machine.

Open MySQL and run:
```bash
mysql -u root -p < database/grievo.sql
```

This will create the `grievo_db` database with all required tables.

Then seed the departments and categories by running these SQL commands in MySQL:
```sql
USE grievo_db;

INSERT INTO departments (department_name) VALUES
('Academics'),
('Infrastructure & Facilities'),
('Hostel & Campus Life'),
('Administration & Services'),
('Transportation'),
('IT & Digital Services'),
('Health & Safety'),
('Feedback & Suggestions');

INSERT INTO categories (category_name, department_id, expected_resolution_days) VALUES
('Faculty Issue', 1, 7),
('Exam / Marks Issue', 1, 5),
('Course & Curriculum Issues', 1, 7),
('Examination & Evaluation', 1, 5),
('Internal Marks / Grading', 1, 5),
('Timetable / Schedule Conflicts', 1, 3),
('Attendance Issues', 1, 3),
('Result Delay / Errors', 1, 5),
('Faculty Teaching Concerns', 1, 7),
('Classroom Facilities', 2, 4),
('Laboratory / Equipment Issues', 2, 5),
('Library Services', 2, 3),
('Wi-Fi / Internet Issues', 2, 3),
('Power / Water Supply', 2, 2),
('Cleanliness & Hygiene', 2, 2),
('Hostel Maintenance', 3, 3),
('Hostel Accommodation', 3, 5),
('Water / Electricity in Hostel', 3, 2),
('Mess / Food Quality', 3, 3),
('Room Maintenance', 3, 3),
('Security Issues', 3, 2),
('Ragging / Harassment (Confidential)', 3, 1),
('Fee Payment Issues', 4, 5),
('Scholarship / Financial Aid', 4, 7),
('Classroom Facilities', 4, 4),
('ID Card / Certificate Requests', 4, 5),
('Office Staff Behavior', 4, 3),
('Document Delay', 4, 5),
('College Bus Timing', 5, 3),
('Bus Condition', 5, 5),
('Route Issues', 5, 3),
('Transport Staff Behavior', 5, 3),
('LMS / Portal Issues', 6, 2),
('Email / Login Problems', 6, 2),
('ERP Issues', 6, 3),
('Online Exam Issues', 6, 2),
('Medical Facility', 7, 2),
('Emergency Assistance', 7, 1),
('Safety Hazards', 7, 2),
('Mental Health Support', 7, 3),
('Course Feedback', 8, 7),
('Faculty Feedback', 8, 7),
('Facility Feedback', 8, 7),
('Event Feedback', 8, 7),
('General Suggestions', 8, 7);
```

### 4. Create admin accounts
After backend is running, register admin accounts using these curl commands:
```bash
curl -X POST http://localhost:5000/register -H "Content-Type: application/json" -d "{\"name\":\"Mr. Saurabh Sharma\",\"email\":\"ad0001@srmist.edu.in\",\"password\":\"admin123\",\"role\":\"admin\"}"

curl -X POST http://localhost:5000/register -H "Content-Type: application/json" -d "{\"name\":\"Mrs. Garima Pandey\",\"email\":\"ad0002@srmist.edu.in\",\"password\":\"admin123\",\"role\":\"admin\"}"

curl -X POST http://localhost:5000/register -H "Content-Type: application/json" -d "{\"name\":\"Mr. Chiranjeet Dutta\",\"email\":\"ad0003@srmist.edu.in\",\"password\":\"admin123\",\"role\":\"admin\"}"

curl -X POST http://localhost:5000/register -H "Content-Type: application/json" -d "{\"name\":\"Mr. Parbhat Gupta\",\"email\":\"ad0004@srmist.edu.in\",\"password\":\"admin123\",\"role\":\"admin\"}"

curl -X POST http://localhost:5000/register -H "Content-Type: application/json" -d "{\"name\":\"Mrs. Pallavi Jain\",\"email\":\"ad0005@srmist.edu.in\",\"password\":\"admin123\",\"role\":\"admin\"}"

curl -X POST http://localhost:5000/register -H "Content-Type: application/json" -d "{\"name\":\"Mr. Kshitij Saxena\",\"email\":\"ad0006@srmist.edu.in\",\"password\":\"admin123\",\"role\":\"admin\"}"

curl -X POST http://localhost:5000/register -H "Content-Type: application/json" -d "{\"name\":\"Mr. Ajay Singh Yadav\",\"email\":\"ad0007@srmist.edu.in\",\"password\":\"admin123\",\"role\":\"admin\"}"
```

Then assign departments in MySQL:
```sql
UPDATE users SET department_id = 1 WHERE email = 'ad0001@srmist.edu.in';
UPDATE users SET department_id = 2 WHERE email = 'ad0002@srmist.edu.in';
UPDATE users SET department_id = 3 WHERE email = 'ad0003@srmist.edu.in';
UPDATE users SET department_id = 4 WHERE email = 'ad0004@srmist.edu.in';
UPDATE users SET department_id = 5 WHERE email = 'ad0005@srmist.edu.in';
UPDATE users SET department_id = 6 WHERE email = 'ad0006@srmist.edu.in';
UPDATE users SET department_id = 7 WHERE email = 'ad0007@srmist.edu.in';
```

### 5. Create `.env` file
Create a file named `.env` in the backend root folder:
```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=grievo_db
MAIL_EMAIL=your_gmail@gmail.com
MAIL_PASSWORD=your_gmail_app_password
```

> ⚠️ For Gmail App Password: Go to Google Account → Security → 2-Step Verification → App Passwords → Generate one for Mail.

### 6. Run the backend
```bash
python run.py
```

Backend will start at `http://localhost:5000`

Verify it's working:
- `http://localhost:5000/` → should show "GRIEVO Backend is running ✅"
- `http://localhost:5000/db-test` → should show all tables

---

## 🎨 Frontend Setup

### 1. Switch to frontend branch
```bash
git checkout project-ui
```

### 2. Install dependencies
```bash
npm install
```

### 3. Run the frontend
```bash
npm run dev
```

Frontend will start at `http://localhost:5173`

---

## 👥 Test Accounts

### Student
Register a student account at `/register` endpoint or use curl:
```bash
curl -X POST http://localhost:5000/register -H "Content-Type: application/json" -d "{\"name\":\"Test Student\",\"email\":\"ts1234@srmist.edu.in\",\"password\":\"test123\",\"role\":\"student\"}"
```
> Note: Only `@srmist.edu.in` emails are allowed. Format: 2 letters + 4 digits (e.g. `ts1234@srmist.edu.in`)

### Admin Accounts
| Domain | Name | Email | Password |
|--------|------|-------|----------|
| Academics | Mr. Saurabh Sharma | ad0001@srmist.edu.in | admin123 |
| Infrastructure | Mrs. Garima Pandey | ad0002@srmist.edu.in | admin123 |
| Hostel | Mr. Chiranjeet Dutta | ad0003@srmist.edu.in | admin123 |
| Administration | Mr. Parbhat Gupta | ad0004@srmist.edu.in | admin123 |
| Transportation | Mrs. Pallavi Jain | ad0005@srmist.edu.in | admin123 |
| IT & Digital | Mr. Kshitij Saxena | ad0006@srmist.edu.in | admin123 |
| Health & Safety | Mr. Ajay Singh Yadav | ad0007@srmist.edu.in | admin123 |

---

## 🔁 Complete User Flow

1. **Student** submits grievance → system auto-assigns to correct domain admin → admin gets email notification
2. **Admin** reviews grievance → adds response → updates status → student gets email notification
3. **Student** sees response and new status → gives mandatory feedback (✅ Resolved or ❌ Not Resolved)
4. If resolved → grievance is Closed. If not → grievance reopens for admin to handle again

---

## 📧 Email Notifications

- Admin receives email when a new grievance is assigned to their domain
- Student receives email when status is updated
- Student receives email when admin adds a response

---

## 🗂️ API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/register` | Register new user |
| POST | `/login` | Login |

### Grievances
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/grievance/submit` | Submit grievance (with optional image) |
| GET | `/grievance/my/<student_id>` | Get student's grievances |
| GET | `/grievance/<id>/responses` | Get admin responses |
| GET | `/uploads/<filename>` | View attachment |

### Admin
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/admin/grievances?department_id=1` | Get grievances by department |
| POST | `/admin/assign` | Assign grievance to resolver |
| GET | `/admin/delayed-grievances` | Get delayed grievances |

### Resolver
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/resolver/update-status` | Update grievance status |
| POST | `/resolver/respond` | Add response to grievance |

### Master Data
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/departments` | Get all departments |
| GET | `/categories` | Get all categories |
| GET | `/categories/by-department/<id>` | Get categories by department |

### Feedback
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/feedback/submit` | Submit feedback |

---

## 👨‍💻 Team

- Backend & Integration — Aditya
- Frontend UI — Team
- Database Design — Team

---

## 📌 Notes

- Make sure MySQL is running before starting the backend
- Make sure backend is running before starting the frontend
- Both must run simultaneously — backend on port 5000, frontend on port 5173
- Email notifications require a valid Gmail account with App Password enabled
