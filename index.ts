import express = require("express");
import Database from 'better-sqlite3';

const app = express();
const PORT = 9090;
const cors = require("cors");

app.use(express.json());
app.use(
    cors({
        origin: "*"
    })
);
const db = new Database('./data.db', {
    verbose: console.log
});

const getAllApplicants = db.prepare(`
SELECT * FROM applicants;
`);

const getApplicantById = db.prepare(`
SELECT * FROM applicants WHERE id = ?;
`);

const getInterviewsByApplicantId = db.prepare(`
SELECT interviews.id,
interviews.score,
interviews.date,
interviews.interviewerId,
interviews.score,
interviewers.name as interviewerName,
interviewers.email as interviewerEmail FROM interviews
JOIN interviewers ON interviewers.id = interviews.interviewerId
WHERE interviews.applicantId = ?;
`);

const getAllInterviewers = db.prepare(`
SELECT * FROM interviewers;
`);

const getInterviewerById = db.prepare(`
SELECT * FROM interviewers WHERE id = ?;
`);

const getInterviewsByInterviewerId = db.prepare(`
SELECT interviews.id,
interviews.score,
interviews.date,
interviews.applicantId,
interviews.score,
applicants.name as applicantName,
applicants.email as applicantEmail FROM interviews
JOIN applicants ON applicants.id = interviews.applicantId
WHERE interviews.interviewerId = ?;
`);

const createApplicant = db.prepare(`
INSERT INTO applicants (name, email) VALUES (?,?);
`);

const createInterviewer = db.prepare(`
INSERT INTO interviewers (name, email) VALUES (?,?);
`);

const createInterview = db.prepare(`
INSERT INTO interviews (applicantId, interviewerId, date, score) VALUES (?,?,?,?);
`);

const getInterviewById = db.prepare(`
    SELECT * FROM interviews WHERE id = ?;
`);

app.get('/applicants', (req, res) => {
    const applicants = getAllApplicants.all();

    for (const applicant of applicants) {
        applicant.interviews = getInterviewsByApplicantId.all(applicant.id);
    }

    res.send(applicants);
});

app.get('/applicants/:id', (req, res) => {
    const id = req.params.id;
    const applicant = getApplicantById.get(id);
    if (applicant) {
        applicant.interviews = getInterviewsByApplicantId.all(applicant.id);
        res.send(applicant);
    } else {
        res.status(404).send({ error: 'Applicant not found!' });
    }
});

app.get('/interviewers', (req, res) => {
    const interviewers = getAllInterviewers.all();

    for (const interviewer of interviewers) {
        interviewer.interviews = getInterviewsByInterviewerId.all(interviewer.id);
    }

    res.send(interviewers);
});

app.get('/interviewers/:id', (req, res) => {
    const id = req.params.id;
    const interviewer = getInterviewerById.get(id);
    if (interviewer) {
        interviewer.interviews = getInterviewsByInterviewerId.all(interviewer.id);
        res.send(interviewer);
    } else {
        res.status(404).send({ error: 'Interviewer not found!' });
    }
});

app.post('/applicants', (req, res) => {
    const { name, email } = req.body;

    const errors = [];
    if (typeof name !== 'string') errors.push(`name is missing or not a string`);
    if (typeof email !== 'string')
        errors.push(`email is missing or not a string`);

    if (errors.length === 0) {
        const info = createApplicant.run(name, email);
        const newApplicant = getApplicantById.get(info.lastInsertRowid);
        res.send(newApplicant);
    } else {
        res.status(400).send({ errors: errors });
    }
});

app.post('/interviewers', (req, res) => {
    const { name, email } = req.body;

    const errors = [];
    if (typeof name !== 'string') errors.push('name is missing or not a string');
    if (typeof email !== 'string') errors.push('email is missing or not a string');

    if (errors.length === 0) {
        const info = createInterviewer.run(name, email);
        const interviewer = getInterviewerById.get(info.lastInsertRowid);
        res.status(201).send(interviewer)
    } else {
        res.status(400).send({ errors: errors });
    }
});

app.post('/interviews', (req, res) => {
    const { applicantId, interviewerId, date, score } = req.body;
    const errors = [];

    if (typeof applicantId !== 'number') errors.push({ error: 'applicantId is missing or not a number!' });
    if (typeof interviewerId !== 'number') errors.push({ error: 'interviewerId is missing or not a number!' });
    if (typeof date !== 'string') errors.push({ error: 'date missing or not a string' });
    if (typeof score !== "number") errors.push(`score not a number`)

    if (errors.length === 0) {
        const applicant = getApplicantById.get(applicantId);
        const interviewer = getInterviewerById.get(interviewerId);

        if (applicant && interviewer) {
            const result = createInterview.run(
                applicantId,
                interviewerId,
                date,
                score
            );
            const newInterview = getInterviewById.get(result.lastInsertRowid);
            res.send(newInterview);
        } else {
            res.status(404).send({ error: 'Applicant or Interviewer not found!' });
        }
    } else {
        res.status(400).send(errors);
    }
});

app.listen(PORT, () => {
    console.log(`Server is up and running on http://localhost:${PORT}`);
});
