import { useParams } from "react-router-dom";
import { getResumeById } from "../resumeFakeApi";
import { useEffect, useState } from "react";

function ResumeDetail() {
  const { id } = useParams();
  const [resume, setResume] = useState(null);

  useEffect(() => {
    getResumeById(id)
      .then((data) => {
        setResume(data);
      })
      .catch((error) => {
        console.error("Ошибка при загрузке резюме:", error);
      });
  }, [id]);

  if (!resume) {
    return <p>Загрузка...</p>;
  }

  return (
    <div>
      <h1>{resume.fullName}</h1>
      <p><strong>Позиция:</strong> {resume.position}</p>
      <p><strong>Город:</strong> {resume.city}</p>
      <p><strong>Возраст:</strong> {resume.age}</p>
      <p><strong>Зарплата:</strong> {resume.salary}</p>
      <p><strong>Опыт:</strong> {resume.experience}</p>
      <p><strong>Навыки:</strong> {resume.skills.join(", ")}</p>
      <p><strong>О себе:</strong> {resume.about}</p>
      <p><strong>Контакты:</strong></p>
      <ul>
        <li><strong>Email:</strong> {resume.contacts.email}</li>
        <li><strong>Телефон:</strong> {resume.contacts.phone}</li>
      </ul>
    </div>
  );
}

export default ResumeDetail