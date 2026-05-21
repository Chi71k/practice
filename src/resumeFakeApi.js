const resumes = [
  {
    id: 1,
    fullName: "Алихан Сейдахметов",
    position: "Frontend Developer",
    city: { value: "astana", label: "Astana" },
    age: 19,
    salary: 350000,
    experience: "1 год",
    skills: [
      {value: "html", label: "HTML"}, 
      {value: "css", label: "CSS"}, 
      {value: "javascript", label: "JavaScript"}, 
      {value: "react", label: "React"}
    ],
    about: "Начинающий frontend-разработчик. Любит создавать аккуратные интерфейсы и изучает React.",
    contacts: {
      email: "alikhan.dev@example.com",
      phone: "+7 701 111 22 33",
    },
  },
  {
    id: 2,
    fullName: "Аружан Нуртаева",
    position: "UI/UX Designer",
    city: { value: "almaty", label: "Almaty" },
    age: 21,
    salary: 400000,
    experience: "2 года",
    skills: [
      {value: "figma", label: "Figma"},
      {value: "prototyping", label: "Prototyping"},
      {value: "design-systems", label: "Design Systems"},
      {value: "user-research", label: "User Research"}
    ],
    about: "Дизайнер интерфейсов. Работает с мобильными и веб-приложениями.",
    contacts: {
      email: "aruzhan.ui@example.com",
      phone: "+7 705 222 33 44",
    },
  },
  {
    id: 3,
    fullName: "Данияр Ахметов",
    position: "Backend Developer",
    city: { value: "karaganda", label: "Karaganda" },
    age: 23,
    salary: 500000,
    experience: "3 года",
    skills: [
      {value: "nodejs", label: "Node.js"},
      {value: "express", label: "Express"},
      {value: "postgresql", label: "PostgreSQL"},
      {value: "docker", label: "Docker"}
    ],
    about: "Backend-разработчик. Занимается API, базами данных и серверной логикой.",
    contacts: {
      email: "daniyar.back@example.com",
      phone: "+7 777 333 44 55",
    },
  },
  {
    id: 4,
    fullName: "Мадина Омарова",
    position: "QA Engineer",
    city: { value: "astana", label: "Astana" },
    age: 20,
    salary: 300000,
    experience: "1.5 года",
    skills: [
      {value: "manual-testing", label: "Manual Testing"},
      {value: "test-cases", label: "Test Cases"},
      {value: "postman", label: "Postman"},
      {value: "bug-reports", label: "Bug Reports"}
    ],
    about: "QA-инженер. Проверяет веб-приложения, пишет тест-кейсы и баг-репорты.",
    contacts: {
      email: "madina.qa@example.com",
      phone: "+7 708 444 55 66",
    },
  },
  {
    id: 5,
    fullName: "Ерасыл Касымов",
    position: "React Developer",
    city: { value: "shymkent", label: "Shymkent" },
    age: 22,
    salary: 450000,
    experience: "2 года",
    skills: [
      {value: "javascript", label: "JavaScript"},
      {value: "react", label: "React"},
      {value: "redux", label: "Redux"},
      {value: "scss", label: "SCSS"}
    ],
    about: "React-разработчик. Делает интерактивные компоненты и работает с состоянием.",
    contacts: {
      email: "yerassyl.react@example.com",
      phone: "+7 700 555 66 77",
    },
  },
];

const fakeFetch = (data, delay = 700) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(data);
    }, delay);
  });
};

export const getResumes = () => {
  return fakeFetch(resumes).then((data) => {
    return data;
  });
};

export const getResumeById = (id) => {
  return fakeFetch(resumes).then((data) => {
    const resume = data.find((resume) => resume.id === Number(id));

    if (!resume) {
      throw new Error("Резюме не найдено");
    }

    return resume;
  });
};
