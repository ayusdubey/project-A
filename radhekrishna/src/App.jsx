import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar/Navbar";

function Home() {
  return <h1>Home Page</h1>;
}

function Salons() {
  return <h1>Find Salon</h1>;
}

function Bookings() {
  return <h1>My Bookings</h1>;
}

function Profile() {
  return <h1>My Profile</h1>;
}

function Settings() {
  return <h1>Settings</h1>;
}

function App() {
  return (
    <BrowserRouter>
      <Navbar />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/salons" element={<Salons />} />
        <Route path="/bookings" element={<Bookings />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;