const db = require('../config/db');

// جلب جميع الامتحانات مع أسئلتها
exports.getExams = async (req, res) => {
    try {
        const { grade } = req.query;
        let query = 'SELECT * FROM exams';
        const params = [];

        if (grade) {
            query += ' WHERE grade = ?';
            params.push(grade);
        }

        query += ' ORDER BY id DESC';
        const [exams] = await db.query(query, params);

        // جلب الأسئلة لكل امتحان
        for (let exam of exams) {
            const [questions] = await db.query('SELECT * FROM questions WHERE exam_id = ?', [exam.id]);
            exam.questions_count = questions.length;
            exam.questions = questions;
        }

        res.json({ success: true, count: exams.length, exams });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// إنشاء أو تعديل امتحان مع أسئلته
exports.saveExam = async (req, res) => {
    const conn = await db.getConnection();
    try {
        await conn.beginTransaction();

        const { id, title, grade, duration_minutes = 45, total_marks = 100, questions = [] } = req.body;

        if (!title || !grade) {
            await conn.rollback();
            return res.status(400).json({ success: false, error: 'عنوان الامتحان والصف الدراسي مطلوبان' });
        }

        let examId = id;

        if (id) {
            // تحديث الامتحان القائم
            await conn.query(
                'UPDATE exams SET title = ?, grade = ?, duration_minutes = ?, total_marks = ? WHERE id = ?',
                [title, grade, duration_minutes, total_marks, id]
            );
            // مسح الأسئلة القديمة لإعادة إدخالها
            await conn.query('DELETE FROM questions WHERE exam_id = ?', [id]);
        } else {
            // إضافة امتحان جديد
            const [result] = await conn.query(
                'INSERT INTO exams (title, grade, duration_minutes, total_marks) VALUES (?, ?, ?, ?)',
                [title, grade, duration_minutes, total_marks]
            );
            examId = result.insertId;
        }

        // إدخال الأسئلة
        if (Array.isArray(questions) && questions.length > 0) {
            const qValues = questions.map(q => [
                examId,
                q.question_text || q.question,
                q.options ? q.options[0] : (q.option_a || ''),
                q.options ? q.options[1] : (q.option_b || ''),
                q.options ? q.options[2] : (q.option_c || ''),
                q.options ? q.options[3] : (q.option_d || ''),
                q.correct_option || ['A', 'B', 'C', 'D'][q.correctIndex || 0] || 'A',
                q.explanation || ''
            ]);

            await conn.query(
                `INSERT INTO questions (exam_id, question_text, option_a, option_b, option_c, option_d, correct_option, explanation)
                 VALUES ?`,
                [qValues]
            );
        }

        await conn.commit();
        res.json({ success: true, message: 'تم حفظ ونشر الامتحان بنجاح', exam_id: examId });
    } catch (err) {
        await conn.rollback();
        res.status(500).json({ success: false, error: err.message });
    } finally {
        conn.release();
    }
};

// تسليم وتصحيح إجابات الامتحان تلقائياً
exports.submitExam = async (req, res) => {
    try {
        const { student_code, exam_id, answers } = req.body; // answers: { question_id: 'A', ... }

        if (!student_code || !exam_id) {
            return res.status(400).json({ success: false, error: 'كود الطالب ومعرف الامتحان مطلوبان' });
        }

        const [examRows] = await db.query('SELECT * FROM exams WHERE id = ?', [exam_id]);
        if (examRows.length === 0) {
            return res.status(404).json({ success: false, error: 'الامتحان غير موجود' });
        }

        const [questions] = await db.query('SELECT * FROM questions WHERE exam_id = ?', [exam_id]);
        if (questions.length === 0) {
            return res.status(400).json({ success: false, error: 'لا توجد أسئلة في هذا الامتحان' });
        }

        let correctCount = 0;
        const markPerQ = examRows[0].total_marks / questions.length;

        questions.forEach(q => {
            const studentAns = answers ? answers[q.id] : null;
            if (studentAns && studentAns.toUpperCase() === q.correct_option.toUpperCase()) {
                correctCount++;
            }
        });

        const finalScore = Math.round(correctCount * markPerQ);

        // تسجيل النتيجة في قاعدة البيانات
        await db.query(
            `INSERT INTO exam_results (student_code, exam_id, score, total_marks, answers_json)
             VALUES (?, ?, ?, ?, ?)`,
            [student_code, exam_id, finalScore, examRows[0].total_marks, JSON.stringify(answers || {})]
        );

        res.json({
            success: true,
            message: 'تم تسليم الامتحان وتصحيحه بنجاح!',
            score: finalScore,
            total_marks: examRows[0].total_marks,
            correct_questions: correctCount,
            total_questions: questions.length
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// حذف امتحان
exports.deleteExam = async (req, res) => {
    try {
        const { id } = req.params;
        await db.query('DELETE FROM exams WHERE id = ?', [id]);
        res.json({ success: true, message: 'تم حذف الامتحان بنجاح' });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};
