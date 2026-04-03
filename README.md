# Caparal Connect (HRIS)

Welcome to **Caparal Connect**, a comprehensive Human Resource Information System (HRIS) designed for Caparal Appliances. This system streamlines workforce tracking, QR-based attendance logs, PVC ID generation, and leave management for both employees and interns.

## Features

* **Role-Based Access Control (RBAC):** Distinct interfaces and capabilities for Admins and Staff.
* **Unified Dashboard:** Real-time analytics and attendance tracking for the total workforce.
* **Universal QR Scanner:** Smart attendance logging that automatically distinguishes between Interns and Employees.
* **ID Card Generator:** Create and print official PVC ID cards (Front and Back) with integrated QR codes.
* **Digital Profiles:** Mobile-friendly, digital ID profiles accessible via QR scan, displaying attendance history.
* **Leave Management:** File, track, and manage employee leave requests (Sick, Vacation, Emergency, Unpaid).
* **Schedule Tracking:** Automatic detection of 'Late' and 'Early Out' entries based on an 8:00 AM - 6:00 PM schedule.
* **Responsive Design:** Fully optimized for both desktop and mobile devices.

## Tech Stack

* **Frontend:** React, TypeScript, Vite
* **Styling:** Tailwind CSS, shadcn/ui
* **State Management:** TanStack Query (React Query)
* **Database & Auth:** Supabase
* **Icons:** Lucide React
* **Routing:** React Router DOM

---

## Getting Started

Follow these instructions to set up the project locally on your machine.

### Prerequisites

Ensure you have the following installed before proceeding:

* **Node.js:** (v18 or higher recommended) - [Download Node.js](https://nodejs.org/)
* **Bun:** We use Bun as the package manager and test runner - [Install Bun](https://bun.sh/)
* **Git:** Version control - [Download Git](https://git-scm.com/)
* **Supabase Account:** For the backend database.

### 1. Clone the Repository

Clone this repository to your local machine using Git:

```bash
git clone [https://github.com/your-username/caparal-connect.git](https://github.com/your-username/caparal-connect.git)
cd caparal-connect
2. Install Dependencies
Use Bun to install all required dependencies:

Bash
bun install
3. Environment Setup (Supabase)
This project requires a Supabase backend to function correctly.

Create a new project on Supabase.

Navigate to your Project Settings > API.

Copy your Project URL and anon public key.

In the root of your project directory, create a .env.local file.

Add your Supabase credentials to the file:

Code snippet
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
4. Database Setup
You need to create the necessary tables in your Supabase database.

In your Supabase dashboard, go to the SQL Editor.

Execute the following SQL queries to set up the database schema and Row Level Security (RLS) policies.

<details>
<summary><b>Click to expand SQL Schema</b></summary>

SQL
-- 1. Create Interns Table
CREATE TABLE interns (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  "internId" TEXT UNIQUE NOT NULL,
  "fullName" TEXT NOT NULL,
  course TEXT NOT NULL,
  school TEXT NOT NULL,
  department TEXT NOT NULL,
  "startDate" TEXT NOT NULL,
  "endDate" TEXT NOT NULL,
  "contactNumber" TEXT,
  status TEXT NOT NULL DEFAULT 'Active',
  photo TEXT,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Create Intern Attendance Table
CREATE TABLE attendance (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  "internId" UUID REFERENCES interns(id) ON DELETE CASCADE,
  date TEXT NOT NULL,
  "timeIn" TEXT NOT NULL,
  "timeOut" TEXT
);

-- 3. Create Employees Table
CREATE TABLE employees (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  "employeeId" TEXT UNIQUE NOT NULL,
  "fullName" TEXT NOT NULL,
  position TEXT NOT NULL,
  department TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'Active',
  photo TEXT,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Create Employee Attendance Table
CREATE TABLE employee_attendance (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  "employeeId" UUID REFERENCES employees(id) ON DELETE CASCADE,
  date TEXT NOT NULL,
  "timeIn" TEXT NOT NULL,
  "timeOut" TEXT
);

-- 5. Create Leave Requests Table
CREATE TABLE leave_requests (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  "employeeId" UUID REFERENCES employees(id) ON DELETE CASCADE,
  "type" TEXT NOT NULL,
  "startDate" TEXT NOT NULL,
  "endDate" TEXT NOT NULL,
  "reason" TEXT NOT NULL,
  "status" TEXT DEFAULT 'Pending',
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. Create App Users (Admin/Staff) Table
CREATE TABLE app_users (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  "fullName" TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'Staff',
  photo TEXT,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. Insert Default Admin and Staff Accounts
INSERT INTO app_users (username, password, "fullName", role)
VALUES ('admin@caparal.com', 'admin123', 'Head Administrator', 'Admin');

INSERT INTO app_users (username, password, "fullName", role)
VALUES ('staff@caparal.com', 'staff123', 'HR Assistant', 'Staff');

-- 8. Enable Row Level Security (RLS) and Create Policies
ALTER TABLE interns ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE employee_attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE leave_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_users ENABLE ROW LEVEL SECURITY;

-- Public Read Access Policies (Needed for QR Scanning profiles)
CREATE POLICY "Public read access for interns" ON interns FOR SELECT USING (true);
CREATE POLICY "Public read access for attendance" ON attendance FOR SELECT USING (true);
CREATE POLICY "Public read access for employees" ON employees FOR SELECT USING (true);
CREATE POLICY "Public read access for emp_attendance" ON employee_attendance FOR SELECT USING (true);
CREATE POLICY "Public read app_users" ON app_users FOR SELECT USING (true);
CREATE POLICY "Public read leave_requests" ON leave_requests FOR SELECT USING (true);

-- Authenticated Modification Policies (Using a simplified approach for this setup)
CREATE POLICY "Auth modify interns" ON interns FOR ALL USING (true);
CREATE POLICY "Auth modify attendance" ON attendance FOR ALL USING (true);
CREATE POLICY "Auth modify employees" ON employees FOR ALL USING (true);
CREATE POLICY "Auth modify emp_attendance" ON employee_attendance FOR ALL USING (true);
CREATE POLICY "Public modify app_users" ON app_users FOR ALL USING (true);
CREATE POLICY "Public modify leave_requests" ON leave_requests FOR ALL USING (true);
</details>

5. Run the Development Server
Start the local development server using Vite:

Bash
bun run dev
The application should now be running. You can access it in your browser at http://localhost:8080/ (or the port specified in your terminal).

6. Login Credentials
You can log in using the default accounts created during the database setup:

Administrator Account:

Username: admin@caparal.com

Password: admin123

Staff Account:

Username: staff@caparal.com

Password: staff123

Deployment
To deploy this project to production, you can use platforms like Vercel, Netlify, or Render.

Connect your GitHub repository to the deployment platform.

Ensure you add your VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY as Environment Variables in the platform's settings.

Set the build command to bun run build and the output directory to dist.

License
This project is licensed under the MIT License.