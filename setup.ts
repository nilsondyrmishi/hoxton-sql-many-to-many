import Database from 'better-sqlite3';

const db = new Database('./data.db', {
    verbose: console.log
});

const interviewers = [
    { name: 'Nicolas', email: 'nicolas@gmail.com' },
    { name: 'Ed', email: 'ed@gmail.com' },
    { name: 'Ben', email: 'Ben@gmail.com' },
    { name: 'Henry', email: 'Henry@gmail.com' }
];

const applicants = [
    { name: 'Nilson', email: 'Nilson@gmail.com' },
    { name: 'Nilson1', email: 'Nilson1@gmail.com' },
    { name: 'Nilson2', email: 'Nilson2@gmail.com' },
    { name: 'Nilson3', email: 'Nilson3@gmail.com' },
    { name: 'Nilson4', email: 'Nilson4@gmail.com' }
];

const interviews = [
    {
        interviewerId: 1,
        applicantId: 1,
        score: 8,
        date: '2022-03-11'
    },
    {
        interviewerId: 1,
        applicantId: 2,
        score: 8,
        date: '2022-02-12'
    },
    {
        interviewerId: 1,
        applicantId: 3,
        score: 7,
        date: '2022-02-13'
    },
    {
        interviewerId: 1,
        applicantId: 4,
        score: 6,
        date: '2022-01-14'
    },
    {
        interviewerId: 1,
        applicantId: 5,
        score:5,
        date: '2022-01-06'
    },
    {
        interviewerId: 2,
        applicantId: 1,
        score: 3,
        date: '2022-04-05'
    },
    {
        interviewerId: 1,
        applicantId: 3,
        score: 10,
        date: '2022-02-07'
    },
    {
        interviewerId: 1,
        applicantId: 5,
        score: 3,
        date: '2022-02-08'
    },

];

db.exec(`
DROP TABLE IF EXISTS interviews;
DROP TABLE IF EXISTS interviewers;
DROP TABLE IF EXISTS applicants;
CREATE TABLE IF NOT EXISTS interviewers (
  id INTEGER,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  PRIMARY KEY (id)
);
CREATE TABLE IF NOT EXISTS applicants (
  id INTEGER,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  PRIMARY KEY (id)
);
CREATE TABLE IF NOT EXISTS interviews (
  id INTEGER,
  interviewerId INTEGER NOT NULL,
  applicantId INTEGER NOT NULL,
  score INTEGER NOT NULL,
  date TEXT NOT NULL,
  PRIMARY KEY (id),
  FOREIGN KEY (interviewerId) REFERENCES interviewers(id),
  FOREIGN KEY (applicantId) REFERENCES applicants(id)
);
`);

const createInterviewer = db.prepare(`
INSERT INTO interviewers (name, email) VALUES (?, ?);
`);

const createApplicant = db.prepare(`
INSERT INTO applicants (name, email) VALUES (?, ?);
`);

const createInterview = db.prepare(`
INSERT INTO interviews (interviewerId, applicantId, score, date)
VALUES (?, ?, ?, ?);
`);

for (const interviewer of interviewers) {
    createInterviewer.run(interviewer.name, interviewer.email);
}

for (const applicant of applicants) {
    createApplicant.run(applicant.name, applicant.email);
}

for (const interview of interviews) {
    createInterview.run(
        interview.interviewerId,
        interview.applicantId,
        interview.score,
        interview.date
    );
}
