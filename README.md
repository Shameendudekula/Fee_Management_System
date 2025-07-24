# 🎓 Fee Management System – JNTUA

A responsive, user-friendly web-based Fee Management System for **JNTUA** that allows students and administrators to manage fee payments efficiently.

---

## 🔧 Features

- 🧑‍🎓 **Student Module**
  - Sign up and login
  - Online fee payment
  - Multi-step payment verification
  - View payment history and reminders

- 🛠️ **Admin Module**
  - Secure admin login
  - Dashboard with statistics (total students, dues, transactions)
  - Manage student records and payments
  - Download & share receipts

- 💰 **Fee Structure**
  - Dynamic dropdowns for College, Hostel, and Exam fees
  - Conditional rendering based on selected options

- 📑 **Receipts**
  - Auto-generated PDF receipts
  - Share/print/download support

- 📞 **Support Pages**
  - Contact Us
  - Feedback & Suggestions
  - Services Overview

---

## 🖥️ Tech Stack

| Technology | Description |
|------------|-------------|
| HTML5 | Markup |
| CSS3 | Styling |
| JavaScript | Interactivity |
| Bootstrap 5 | Responsive UI |
| jsPDF | PDF generation |
| LocalStorage | Data storage (temporary/demo) |

---

## 📁 File Structure
Fee_Management_System/
├── FeeManagementSystem.html # Home page
├── payment.html # Main logic (Login, Payment, Admin)
├── feestructurepage.html # Dynamic fee structure UI
├── contactpage.html # Contact form
├── feedback&suggestionspage.html # Feedback form
├── servicespage.html # Services overview
├── style4.css # Styles for payment.html (if applicable)
├── README.md # Project info
└── .gitignore # Ignored files (e.g., node_modules)


---

## 🚀 Future Enhancements

- Backend integration (Node.js + MongoDB)
- Real-time payment gateway (e.g., Razorpay, Paytm)
- Email notifications
- Session-based authentication

---

## 📝 License

This project is licensed under the [MIT License](LICENSE).

---

## 🙋‍♂️ Author

Developed as part of a web-based frontend project for **JNTUA** students.  
Contributions and improvements are welcome!

## 🚀 Getting Started

To run this project locally, follow these steps:

### 📦 Prerequisites
- Node.js installed

### ▶️ Run Instructions

1. Clone the repository:
   ```bash
  git clone https://github.com/Shameendudekula/Fee_Management_System.git
  cd Fee_Management_System
  npm install
  node server1.js

  Use a Live Server (VS Code extension) to open FeeManagementSystem.html
                  OR

Manually open the HTML file in your browser:
FeeManagementSystem.html




