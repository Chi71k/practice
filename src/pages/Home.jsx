import { useState } from "react";
import '../styles/Home.css'


function Home() {
  const [count, setCount] = useState(0);

  return (
    <div>
      <p>Счетчик: {count}</p>
      <button onClick={() => setCount(count + 5)}>
        Нажми
      </button>
    </div>
  )
}

export default Home