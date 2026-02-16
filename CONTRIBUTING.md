# 🤝 วิธีการสนับสนุน (Contributing)

ขอบคุณที่สนใจเข้าร่วมการพัฒนา Thai Election Voting System! 

## 📋 ขั้นตอนการสนับสนุน

### 1. Fork Repository
- ไปที่ https://github.com/YOUR_USERNAME/thai-election-voting-system
- คลิก "Fork" ที่มุมขวาบน
- สร้าง copy ของ repository ไว้ในบัญชีของคุณ

### 2. Clone to Your Computer
```bash
git clone https://github.com/YOUR_USERNAME/thai-election-voting-system.git
cd thai-election-voting-system
```

### 3. Create Feature Branch
```bash
git checkout -b feature/your-feature-name
```

ตัวอย่าง:
```bash
git checkout -b feature/add-dark-mode
git checkout -b bugfix/fix-login-error
git checkout -b docs/update-readme
```

### 4. Make Changes
แก้ไขไฟล์ตามที่ต้องการ:
- `server.js` - Backend logic
- `public/app.js` - Frontend logic
- `public/index.html` - HTML structure
- `public/styles.css` - Styling
- `README.md` - Documentation

### 5. Test Your Changes
```bash
# ตรวจสอบว่าโปรแกรมทำงานด้วยดี
npm start

# เข้าไปที่ http://localhost:3000 และทดสอบ
```

### 6. Commit Changes
```bash
git add .
git commit -m "Add: feature description"
```

ตัวอย่าง commit message:
- `Add: dark mode feature`
- `Fix: login form validation`
- `Docs: update installation guide`
- `Refactor: optimize database queries`

### 7. Push to Your Fork
```bash
git push origin feature/your-feature-name
```

### 8. Create Pull Request
1. ไปที่ GitHub repository ของคุณ
2. คลิก "Compare & pull request"
3. กรอกข้อมูล:
   - **Title**: ชื่อสั้นของ PR
   - **Description**: อธิบายสิ่งที่เปลี่ยนแปลง
4. คลิก "Create pull request"

## 📝 Commit Message Guidelines

ขณะ commit ให้ใช้รูปแบบนี้:

```
<type>: <subject>

<body>

<footer>
```

### Types:
- **feat**: ฟีเจอร์ใหม่
- **fix**: แก้ไขบั้ก
- **docs**: เปลี่ยนแปลง documentation
- **style**: เปลี่ยนแปลง code style (ไม่มี functional changes)
- **refactor**: เปลี่ยนแปลงโค้ด (ไม่มี feature หรือ bug fix)
- **perf**: ปรับปรุง performance
- **test**: เพิ่ม tests

### ตัวอย่าง:
```
feat: add OTP authentication

- Implement OTP generation
- Add SMS verification
- Update database schema

Closes #123
```

## 🏗️ Project Structure

```
thai-election-voting-system/
├── server.js                 # Express server & API
├── package.json             # Dependencies
├── public/
│   ├── index.html          # UI structure
│   ├── styles.css          # Styling
│   └── app.js              # Frontend logic
├── README.md               # Documentation
└── CONTRIBUTING.md         # This file
```

## 🛠️ Development Workflow

### Running the Application
```bash
npm install      # Install dependencies
npm start        # Start development server
```

### Code Style
- ใช้ 2 spaces สำหรับ indentation
- ใช้ semicolons
- ใช้ camelCase สำหรับ variables และ functions
- ใช้ UPPER_CASE สำหรับ constants

### Testing Changes
1. เปิด http://localhost:3000
2. ทดสอบจากผู้ใช้งานทั่วไป (User Perspective)
3. ตรวจสอบความสำเร็จและความล้มเหลว
4. ทดสอบ edge cases

## 🎯 ฟีเจอร์ที่กำลังหาสนับสนุน

- [ ] Dark mode UI
- [ ] Mobile app optimization
- [ ] Language support (EN, CN)
- [ ] Admin dashboard
- [ ] Real-time statistics
- [ ] Data export (PDF/Excel)
- [ ] Two-factor authentication
- [ ] Database backup system

## ❌ สิ่งที่ต้องหลีกเลี่ยง

- ❌ ลบ `.gitignore` หรือ `package.json`
- ❌ เปลี่ยนโครงสร้าง directory ครั้งใหญ่
- ❌ เพิ่ม dependencies ที่ไม่จำเป็น
- ❌ Commit `node_modules` หรือ `.env`
- ❌ Push ไปยัง main โดยตรง

## ✅ Checklist ก่อน Submit PR

- [ ] โค้ดทำงานได้ถูกต้อง
- [ ] ไม่มี console errors
- [ ] Updated README ถ้าต้อง
- [ ] ข้อความ commit ชัดเจน
- [ ] PR description ครบถ้วน
- [ ] ไม่มี merge conflicts

## 📚 Useful Resources

- [Node.js Documentation](https://nodejs.org/docs/)
- [Express.js Guide](https://expressjs.com/)
- [SQLite3 Documentation](https://www.sqlite.org/docs.html)
- [Socket.io Documentation](https://socket.io/docs/)
- [Git Workflow](https://www.atlassian.com/git/tutorials)

## 💬 Communication

- Issues: ถาม คำถาม และรายงาน bugs
- Discussions: แชร์ไอเดียและวิวาท
- Pull Requests: ส่งโค้ดที่พร้อมสำหรับ review

## 🎓 Code Review Process

1. **Author** submits PR
2. **Reviewers** check the code
3. **Discussion** about changes (if needed)
4. **Updates** based on feedback
5. **Approval** จาก maintainers
6. **Merge** เข้า main branch

## 🙏 ขอบคุณ

ขอบคุณสำหรับการช่วยเหลือในการพัฒนา Thai Election Voting System!

---

Happy Coding! 🚀
