
import './App.css';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Header from "./Components/Header/Header"

function App() {
  return (
    <div>
      <Router>
        <Header/>
      </Router>
      
    </div>
  );
}

export default App;
